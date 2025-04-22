import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, CustomerProfile } from '@core';
import { AccountResponse, AccountService } from '@core/authentication/account.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, TranslatePipe],
})
export class AccountInformationComponent implements OnInit {
  profile: CustomerProfile | null = null;
  accounts: AccountResponse[] = [];
  selectedAccount: AccountResponse | null = null;

  newAccountForm!: FormGroup;

  // UI state
  loading = true;
  profileLoading = false;
  accountsLoading = false;
  error = '';
  success = '';
  showNewAccountForm = false;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.newAccountForm = this.formBuilder.group({
      accountType: ['savings', Validators.required],
    });
  }

  loadData(): void {
    this.loading = true;
    this.profileLoading = true;
    this.accountsLoading = true;

    // Load customer profile
    this.authService.getCustomerProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.profileLoading = false;
        this.checkLoading();
      },
      error: error => {
        this.error = this.translateService.instant('dashboard.load_account_error');
        this.profileLoading = false;
        this.checkLoading();
      },
    });

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        if (accounts.length > 0) {
          this.selectedAccount = accounts[0];
        }
        this.accountsLoading = false;
        this.checkLoading();
      },
      error: error => {
        this.error = this.translateService.instant('dashboard.load_account_error');
        this.accountsLoading = false;
        this.checkLoading();
      },
    });
  }

  checkLoading(): void {
    this.loading = this.profileLoading || this.accountsLoading;
  }

  onSelectAccount(account: AccountResponse): void {
    this.selectedAccount = account;
  }

  toggleNewAccountForm(): void {
    this.showNewAccountForm = !this.showNewAccountForm;
    if (!this.showNewAccountForm) {
      this.newAccountForm.reset();
      this.newAccountForm.patchValue({ accountType: 'savings' });
    }
  }

  onCreateNewAccount(): void {
    if (this.newAccountForm.invalid) {
      return;
    }

    const accountType = this.newAccountForm.value.accountType;
    this.loading = true;
    this.error = '';
    this.success = '';

    // Call the backend API to create the account
    this.accountService.createAccount(accountType).subscribe({
      next: newAccount => {
        // Add the new account to the accounts list
        this.accounts.push(newAccount);

        // Select the newly created account
        this.selectedAccount = newAccount;
        this.showNewAccountForm = false;

        // Use the correct account creation success message
        this.success = this.translateService.instant('dashboard.account_created_success');
        this.loading = false;

        // Clear the success message after 3 seconds
        setTimeout(() => (this.success = ''), 3000);
      },
      error: error => {
        // Use a generic error message for account creation
        this.error =
          error.error?.message || this.translateService.instant('dashboard.generic_error');
        this.loading = false;

        // Clear the error message after 5 seconds
        setTimeout(() => (this.error = ''), 5000);
      },
    });
  }

  getAccountTypeName(account: AccountResponse): string {
    if (account.interestRate > 0 && account.minimumBalance > 0) {
      return this.translateService.instant('dashboard.savings_account');
    } else {
      return this.translateService.instant('dashboard.checking_account');
    }
  }

  formatCurrency(amount: number): string {
    const currencySymbol = this.translateService.instant('currency_symbol');
    return (
      currencySymbol +
      ' ' +
      amount.toLocaleString(this.translateService.currentLang, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  // Format date to readable format based on current language
  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return 'N/A';

    try {
      const date = new Date(dateStr);
      const currentLang = this.translateService.currentLang;

      // Handle different date formats based on language
      if (currentLang === 'zh-CN' || currentLang === 'zh-TW') {
        // Use Chinese date format
        return date.toLocaleString(currentLang, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        });
      } else {
        // Use English/default date format
        const formattedDate = date.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return `${formattedDate} ${formattedTime}`;
      }
    } catch (e) {
      return String(dateStr);
    }
  }
}
