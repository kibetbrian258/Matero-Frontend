import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  TransactionService,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  TransactionSearchRequest,
  TransactionResponse,
} from '@core/authentication/transaction.service';
import { AccountResponse } from '@core/authentication/account.service';

interface DialogData {
  type: 'deposit' | 'withdraw' | 'transfer' | 'search';
  accounts: AccountResponse[];
  selectedAccountNumber?: string;
}

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class TransactionDialogComponent implements OnInit {
  // Form controls
  accountNumberControl = new FormControl('', Validators.required);
  amountControl = new FormControl(null, [Validators.required, Validators.min(0.01)]);
  destinationAccountControl = new FormControl(null, Validators.required);
  transactionTypeControl = new FormControl(null);
  startDateControl = new FormControl(null);
  endDateControl = new FormControl(null);
  minAmountControl = new FormControl(null, [Validators.min(0)]);
  maxAmountControl = new FormControl(null, [Validators.min(0)]);

  // Data properties
  isLoading = false;
  searchResults: TransactionResponse[] = [];
  showSearchResults = false;
  selectedAccount: AccountResponse | null = null;
  accounts: AccountResponse[] = [];

  constructor(
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.accounts = data.accounts || [];
  }

  ngOnInit(): void {
    // Set initial account selection
    if (this.data.selectedAccountNumber) {
      this.accountNumberControl.setValue(this.data.selectedAccountNumber);
    } else if (this.accounts.length > 0) {
      this.accountNumberControl.setValue(this.accounts[0].accountNumber);
    }

    // Update the selected account
    this.onAccountChange();

    // Apply additional validators based on transaction type
    if (this.data.type === 'withdraw') {
      // Add custom validator to check against account balance
      this.amountControl.addValidators(control => {
        if (!control.value || !this.selectedAccount) return null;

        const amount = parseFloat(control.value);
        if (amount > this.selectedAccount.balance) {
          return { insufficientFunds: true };
        }

        if (amount > this.selectedAccount.withdrawalLimit) {
          return { exceedsLimit: true };
        }

        return null;
      });
    }

    if (this.data.type === 'transfer') {
      // Add custom validator to check against account balance and transfer limit
      this.amountControl.addValidators(control => {
        if (!control.value || !this.selectedAccount) return null;

        const amount = parseFloat(control.value);
        if (amount > this.selectedAccount.balance) {
          return { insufficientFunds: true };
        }

        if (amount > this.selectedAccount.transferLimit) {
          return { exceedsLimit: true };
        }

        return null;
      });
    }
  }

  onAccountChange(): void {
    const accountNumber = this.accountNumberControl.value;
    this.selectedAccount = this.accounts.find(a => a.accountNumber === accountNumber) || null;
  }

  getDialogTitle(): string {
    const titles = {
      deposit: 'Deposit Funds',
      withdraw: 'Withdraw Funds',
      transfer: 'Transfer Funds',
      search: 'Search Transactions',
    };
    return titles[this.data.type] || 'Transaction';
  }

  getActionButtonText(): string {
    const actions = {
      deposit: 'Deposit Funds',
      withdraw: 'Withdraw Funds',
      transfer: 'Transfer Funds',
      search: 'Search Transactions',
    };
    return actions[this.data.type] || 'Submit';
  }

  getMaxWithdrawal(): number {
    if (!this.selectedAccount) return 0;

    // Maximum withdrawal is the lower of balance or withdrawal limit
    return Math.min(this.selectedAccount.balance, this.selectedAccount.withdrawalLimit);
  }

  getOtherAccounts(): AccountResponse[] {
    // Get all accounts except the currently selected one
    return this.accounts.filter(a => a.accountNumber !== this.accountNumberControl.value);
  }

  getAmountErrorMessage(): string {
    const errors = this.amountControl.errors;
    if (!errors) return '';

    if (errors['required']) return 'Amount is required';
    if (errors['min']) return 'Amount must be greater than zero';
    if (errors['insufficientFunds']) return 'Insufficient funds in your account';
    if (errors['exceedsLimit']) {
      if (this.data.type === 'withdraw') {
        return `Amount exceeds your withdrawal limit of Ksh ${this.selectedAccount?.withdrawalLimit.toFixed(2)}`;
      } else {
        return `Amount exceeds your transfer limit of Ksh ${this.selectedAccount?.transferLimit.toFixed(2)}`;
      }
    }

    return 'Invalid amount';
  }

  isActionDisabled(): boolean {
    switch (this.data.type) {
      case 'deposit':
      case 'withdraw':
        return !this.accountNumberControl.valid || !this.amountControl.valid;

      case 'transfer':
        return (
          !this.accountNumberControl.valid ||
          !this.amountControl.valid ||
          !this.destinationAccountControl.valid
        );

      case 'search':
        return !this.accountNumberControl.valid;

      default:
        return false;
    }
  }

  onSubmit(): void {
    if (this.isActionDisabled()) {
      return;
    }

    this.isLoading = true;

    switch (this.data.type) {
      case 'deposit':
        this.handleDeposit();
        break;
      case 'withdraw':
        this.handleWithdraw();
        break;
      case 'transfer':
        this.handleTransfer();
        break;
      case 'search':
        this.handleSearch();
        break;
    }
  }

  handleDeposit(): void {
    const request: DepositRequest = {
      accountNumber: this.accountNumberControl.value || '',
      amount: this.amountControl.value || 0,
    };

    this.transactionService.deposit(request).subscribe({
      next: response => {
        this.isLoading = false;
        this.snackBar.open(
          `Successfully deposited ${request.amount} to account ${request.accountNumber}`,
          'Close',
          {
            duration: 3000,
          }
        );
        this.dialogRef.close(true);
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Deposit failed: ${error.error?.message || 'Unknown error'}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  handleWithdraw(): void {
    const request: WithdrawRequest = {
      accountNumber: this.accountNumberControl.value || '',
      amount: this.amountControl.value || 0,
    };

    this.transactionService.withdraw(request).subscribe({
      next: response => {
        this.isLoading = false;
        this.snackBar.open(
          `Successfully withdrew ${request.amount} from account ${request.accountNumber}`,
          'Close',
          {
            duration: 3000,
          }
        );
        this.dialogRef.close(true);
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(
          `Withdrawal failed: ${error.error?.message || 'Unknown error'}`,
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
  }

  handleTransfer(): void {
    const request: TransferRequest = {
      sourceAccountNumber: this.accountNumberControl.value || '',
      destinationAccountNumber: this.destinationAccountControl.value || '',
      amount: this.amountControl.value || 0,
    };

    this.transactionService.transfer(request).subscribe({
      next: response => {
        this.isLoading = false;
        this.snackBar.open(
          `Successfully transferred ${request.amount} from account ${request.sourceAccountNumber} to ${request.destinationAccountNumber}`,
          'Close',
          {
            duration: 3000,
          }
        );
        this.dialogRef.close(true);
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Transfer failed: ${error.error?.message || 'Unknown error'}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  handleSearch(): void {
    const request: TransactionSearchRequest = {
      accountNumber: this.accountNumberControl.value || undefined,
      type: this.transactionTypeControl.value || undefined,
      startDate: this.startDateControl.value
        ? new Date(this.startDateControl.value).toISOString()
        : undefined,
      endDate: this.endDateControl.value
        ? (() => {
            const date = new Date(this.endDateControl.value);
            date.setHours(23, 59, 59, 999);
            return date.toISOString();
          })()
        : undefined,
      minAmount: this.minAmountControl.value || undefined,
      maxAmount: this.maxAmountControl.value || undefined,
    };

    this.transactionService.searchTransactions(request).subscribe({
      next: response => {
        this.isLoading = false;
        this.searchResults = response;
        this.showSearchResults = true;
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open(`Search failed: ${error.error?.message || 'Unknown error'}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Format currency amount
  formatAmount(amount: number): string {
    return `Ksh ${amount.toFixed(2)}`;
  }

  // Format date to readable format
  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}:${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}Hrs`;
    } catch (e) {
      return dateStr;
    }
  }
}
