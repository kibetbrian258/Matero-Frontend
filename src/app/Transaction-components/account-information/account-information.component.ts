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

@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
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
    private formBuilder: FormBuilder
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
        this.error = 'Could not load profile data';
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
        this.error = 'Could not load account data';
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
        this.success = 'New account created successfully';
        this.loading = false;

        // Clear the success message after 3 seconds
        setTimeout(() => (this.success = ''), 3000);
      },
      error: error => {
        this.error = error.error?.message || 'Error creating account. Please try again.';
        this.loading = false;

        // Clear the error message after 5 seconds
        setTimeout(() => (this.error = ''), 5000);
      },
    });
  }

  getAccountTypeName(account: AccountResponse): string {
    if (account.interestRate > 0 && account.minimumBalance > 0) {
      return 'Savings Account';
    } else {
      return 'Checking Account';
    }
  }

  formatCurrency(amount: number): string {
    return (
      'Ksh ' +
      amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
