import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@core/authentication/account.service';
import { TransactionService } from '@core/authentication/transaction.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface AccountResponse {
  id: number;
  accountNumber: string;
  customerId: string;
  balance: number;
  status: string;
  interestRate: number;
  branchName: string;
  branchCode: string;
  onlineBanking: boolean;
  mobileBanking: boolean;
  monthlyFee: number;
  minimumBalance: number;
  withdrawalLimit: number;
  transferLimit: number;
}

@Component({
  selector: 'app-deposit',
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
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss',
})
export class DepositComponent implements OnInit {
  private readonly translate = inject(TranslateService);

  depositForm!: FormGroup;
  accounts: AccountResponse[] = [];
  loading = false;
  submitted = false;
  success = false;
  error = '';
  loadingAccounts = true;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.depositForm = this.formBuilder.group({
      accountNumber: ['', Validators.required],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allows numbers with up to 2 decimal places
        ],
      ],
    });

    // Load accounts
    this.accountService.getAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.loadingAccounts = false;

        if (accounts.length === 1) {
          this.depositForm.patchValue({
            accountNumber: accounts[0].accountNumber,
          });
        }
      },
      error: error => {
        this.error = this.translate.instant('deposit.load_accounts_error');
        this.loadingAccounts = false;
      },
    });
  }

  get f() {
    return this.depositForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.depositForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const depositRequest = {
      accountNumber: this.f['accountNumber'].value,
      amount: parseFloat(this.f['amount'].value),
    };

    this.transactionService.deposit(depositRequest).subscribe({
      next: response => {
        this.loading = false;
        this.success = true;

        this.depositForm.reset();
        this.submitted = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: error => {
        this.error =
          error.error.message ||
          error.error.error ||
          this.translate.instant('deposit.generic_error');
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
