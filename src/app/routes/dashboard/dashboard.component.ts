import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { PageHeaderComponent } from '@shared';
import { RemoveMenuPrefixPipe } from '@shared/components/Prefix-removal/remove-menu-prefix.pipe';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from '@core';
import { filter, finalize, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AccountResponse, AccountService } from '@core/authentication/account.service';
import { TransactionResponse, TransactionService } from '@core/authentication/transaction.service';
import { CustomerProfileResponse, CustomerService } from '@core/authentication/customer.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    RemoveMenuPrefixPipe,
    MatIconModule,
    TranslateModule,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly menu = inject(MenuService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);
  private readonly customerService = inject(CustomerService);
  private readonly translate = inject(TranslateService);

  private subscriptions = new Subscription();

  // page title
  pageTitle = 'dashboard.title';

  // Dashboard data
  customerProfile: CustomerProfileResponse | null = null;
  accounts: AccountResponse[] = [];
  currentAccount: AccountResponse | null = null;
  recentTransactions: TransactionResponse[] = [];

  // Loading states
  isLoadingAccounts = false;
  isLoadingTransactions = false;
  isLoadingProfile = false;

  // Error states
  accountsError = false;
  transactionsError = false;
  profileError = false;

  ngOnInit() {
    // Listen to route changes to update the page title
    this.subscriptions.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
        this.updatePageTitle();
      })
    );

    // Listen to active menu item changes
    this.subscriptions.add(
      this.menu.getActiveMenuItem().subscribe(menuName => {
        if (menuName) {
          this.pageTitle = menuName;
        }
      })
    );

    // Set initial page title
    this.updatePageTitle();

    // Load profile, account and transaction data
    this.loadCustomerProfile();
    this.loadAccountData();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }

  private updatePageTitle() {
    const routes = this.router.url.slice(1).split('/');
    const menuLevel = this.menu.getLevel(routes);

    // Update the page title based on the current route
    if (menuLevel && menuLevel.length > 0) {
      this.pageTitle = menuLevel[menuLevel.length - 1];
    } else {
      this.pageTitle = 'dashboard.title';
    }
  }

  loadCustomerProfile(): void {
    this.isLoadingProfile = true;
    this.profileError = false;

    this.subscriptions.add(
      this.customerService
        .getProfile()
        .pipe(
          finalize(() => {
            this.isLoadingProfile = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: profile => {
            this.customerProfile = profile;
          },
          error: error => {
            console.error('Error fetching customer profile:', error);
            this.profileError = true;
          },
        })
    );
  }

  loadAccountData(): void {
    this.isLoadingAccounts = true;
    this.accountsError = false;

    this.subscriptions.add(
      this.accountService
        .getAccounts()
        .pipe(
          finalize(() => {
            this.isLoadingAccounts = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: accounts => {
            this.accounts = accounts;
            if (accounts.length > 0) {
              this.currentAccount = accounts[0]; // Default to first account
              this.loadRecentTransactions(this.currentAccount.accountNumber);
            }
          },
          error: error => {
            console.error('Error fetching accounts:', error);
            this.accountsError = true;
          },
        })
    );
  }

  loadRecentTransactions(accountNumber: string): void {
    this.isLoadingTransactions = true;
    this.transactionsError = false;

    this.subscriptions.add(
      this.transactionService
        .getRecentTransactions(accountNumber)
        .pipe(
          finalize(() => {
            this.isLoadingTransactions = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: transactions => {
            this.recentTransactions = transactions;
          },
          error: error => {
            console.error('Error fetching transactions:', error);
            this.transactionsError = true;
          },
        })
    );
  }

  // Navigate to transaction pages instead of opening dialogs
  navigateToDeposit(): void {
    this.router.navigate(['/deposit']);
  }

  navigateToWithdraw(): void {
    this.router.navigate(['/withdraw']);
  }

  navigateToTransfer(): void {
    this.router.navigate(['/transfer']);
  }

  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  viewAllTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  // Helper method to properly format transaction type keys for translation
  getTransactionTypeKey(type: string): string {
    // Normalize the type to lowercase and replace spaces with underscores
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    return `transaction.type.${normalizedType}`;
  }

  // Format date to readable format
  formatDate(dateStr: string): string {
    try {
      // Get current language for date formatting
      const currentLang = this.translate.currentLang;
      let locale = 'en-US';

      // Map language code to locale
      if (currentLang === 'zh-CN' || currentLang === 'zh-TW') {
        locale = currentLang;
      } else if (currentLang === 'sw') {
        locale = 'sw-KE'; // Swahili (Kenya)
      }

      return formatDate(
        dateStr,
        this.translate.instant('date_format') || 'dd/MM/yy h:mm a',
        locale
      );
    } catch (e) {
      return dateStr;
    }
  }

  // Format amount to Kenyan Shillings
  formatAmount(amount: number): string {
    try {
      const currencySymbol = this.translate.instant('currency_symbol') || 'Ksh';
      // Use the browser's Intl API for currency formatting
      return `${currencySymbol} ${amount.toFixed(2)}`;
    } catch (e) {
      return `Ksh ${amount.toFixed(2)}`;
    }
  }

  // In your dashboard.component.ts file
  selectAccount(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const account = this.accounts.find(acc => acc.accountNumber === value);
    if (account) {
      this.currentAccount = account;
      this.loadRecentTransactions(value);
    }
  }
}
