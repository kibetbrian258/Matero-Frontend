import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-transfer',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
})
export class TransferComponent implements OnInit {
  transferForm!: FormGroup;
  accounts: AccountResponse[] = [];
  loading = false;
  submitted = false;
  success = false;
  error = '';
  loadingAccounts = true;
  selectedSourceAccount: AccountResponse | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.transferForm = this.formBuilder.group({
      sourceAccountNumber: ['', Validators.required],
      destinationAccountNumber: [
        '',
        [Validators.required, this.differentAccountValidator.bind(this)],
      ],
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
          this.selectSourceAccount(accounts[0].accountNumber);
        }
      },
      error: error => {
        this.error = 'Could not load accounts. Please try again.';
        this.loadingAccounts = false;
      },
    });

    // Listen for source account selection changes
    this.f['sourceAccountNumber'].valueChanges.subscribe(accountNumber => {
      if (accountNumber) {
        this.selectSourceAccount(accountNumber);

        // Validate destination account
        this.f['destinationAccountNumber'].updateValueAndValidity();
      } else {
        this.selectedSourceAccount = null;
      }
    });
  }

  // Convenience getter for form fields
  get f() {
    return this.transferForm.controls;
  }

  // Handle source account selection
  selectSourceAccount(accountNumber: string): void {
    this.selectedSourceAccount =
      this.accounts.find(acc => acc.accountNumber === accountNumber) || null;
    this.transferForm.patchValue({
      sourceAccountNumber: accountNumber,
    });

    // Update amount validators based on source account
    this.updateAmountValidators();
  }

  // Add validators based on account balance and limits
  updateAmountValidators(): void {
    const amountControl = this.f['amount'];

    if (this.selectedSourceAccount) {
      const maxAmount =
        this.selectedSourceAccount.transferLimit < this.selectedSourceAccount.balance
          ? this.selectedSourceAccount.transferLimit
          : this.selectedSourceAccount.balance;

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

  // Custom validator to ensure destination account is different from source
  differentAccountValidator(control: any) {
    if (!this.transferForm) return null;

    const sourceAccount = this.transferForm.get('sourceAccountNumber')?.value;
    const destinationAccount = control.value;

    if (sourceAccount && destinationAccount && sourceAccount === destinationAccount) {
      return { sameAccount: true };
    }

    return null;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.transferForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const transferRequest = {
      sourceAccountNumber: this.f['sourceAccountNumber'].value,
      destinationAccountNumber: this.f['destinationAccountNumber'].value,
      amount: parseFloat(this.f['amount'].value),
    };

    this.transactionService.transfer(transferRequest).subscribe({
      next: response => {
        this.loading = false;
        this.success = true;

        // Reset form
        this.transferForm.reset();
        this.submitted = false;

        // Automatically redirect after successful transfer
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: error => {
        this.error =
          error.error.message || error.error.error || 'Transfer failed. Please try again.';
        this.loading = false;
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}