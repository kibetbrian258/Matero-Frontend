import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountResponse, AccountService } from '@core/authentication/account.service';
import { TransactionService } from '@core/authentication/transaction.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.scss',
})
export class WithdrawComponent implements OnInit {
  private readonly translate = inject(TranslateService);

  withdrawForm!: FormGroup;
  accounts: AccountResponse[] = [];
  loading = false;
  submitted = false;
  success = false;
  error = '';
  loadingAccounts = true;
  selectedAccount: AccountResponse | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.withdrawForm = this.formBuilder.group({
      accountNumber: ['', Validators.required],
      amount: [
        '',
        [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
    });

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.loadingAccounts = false;

        // If there's only one account, automatically select it
        if (accounts.length === 1) {
          this.selectAccount(accounts[0].accountNumber);
        }
      },
      error: error => {
        this.error = this.translate.instant('withdraw.load_accounts_error');
        this.loadingAccounts = false;
      },
    });

    // Listen for account selection changes
    this.f['accountNumber'].valueChanges.subscribe(accountNumber => {
      if (accountNumber) {
        this.selectAccount(accountNumber);
      } else {
        this.selectedAccount = null;
      }
    });
  }

  // Convenience getter for form fields
  get f() {
    return this.withdrawForm.controls;
  }

  // Handle account selection
  selectAccount(accountNumber: string): void {
    this.selectedAccount = this.accounts.find(acc => acc.accountNumber === accountNumber) || null;
    this.withdrawForm.patchValue({
      accountNumber: accountNumber,
    });

    // Validate that amount doesn't exceed balance
    this.updateAmountValidators();
  }

  // Add validators based on account balance and limits
  updateAmountValidators(): void {
    const amountControl = this.f['amount'];

    if (this.selectedAccount) {
      const maxAmount =
        this.selectedAccount.withdrawalLimit < this.selectedAccount.balance
          ? this.selectedAccount.withdrawalLimit
          : this.selectedAccount.balance;

      amountControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(maxAmount),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ]);
    } else {
      amountControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ]);
    }

    amountControl.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.withdrawForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const withdrawRequest = {
      accountNumber: this.f['accountNumber'].value,
      amount: parseFloat(this.f['amount'].value),
    };

    this.transactionService.withdraw(withdrawRequest).subscribe({
      next: response => {
        this.loading = false;
        this.success = true;

        // Reset form
        this.withdrawForm.reset();
        this.submitted = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: error => {
        this.error =
          error.error.message ||
          error.error.error ||
          this.translate.instant('withdraw.generic_error');
        this.loading = false;
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Format amount to use currency symbol from translation
  formatAmount(amount: number): string {
    try {
      const currencySymbol = this.translate.instant('currency_symbol') || 'Ksh';
      return `${currencySymbol} ${amount.toFixed(2)}`;
    } catch (e) {
      return `Ksh ${amount.toFixed(2)}`;
    }
  }
}
