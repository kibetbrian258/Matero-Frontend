import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface TransactionResponse {
  transactionId: string;
  accountNumber: string;
  type: string;
  amount: number;
  balanceAfterTransaction: number;
  transactionDateTime: string;
  status: string;
  destinationAccountNumber?: string;
}

export interface DepositRequest {
  accountNumber: string;
  amount: number;
}

export interface WithdrawRequest {
  accountNumber: string;
  amount: number;
}

export interface TransferRequest {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
}

export interface TransactionSearchRequest {
  accountNumber?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/transactions`;

  /**
   * Deposit money into an account
   */
  deposit(request: DepositRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.baseUrl}/deposit`, request);
  }

  /**
   * Withdraw money from an account
   */
  withdraw(request: WithdrawRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.baseUrl}/withdraw`, request);
  }

  /**
   * Transfer money between accounts
   */
  transfer(request: TransferRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.baseUrl}/transfer`, request);
  }

  /**
   * Get recent transactions for an account
   */
  getRecentTransactions(accountNumber: string): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.baseUrl}/recent/${accountNumber}`);
  }

  /**
   * Search transactions with specified filters
   */
  searchTransactions(request: TransactionSearchRequest): Observable<TransactionResponse[]> {
    return this.http.post<TransactionResponse[]>(`${this.baseUrl}/search`, request);
  }

  /**
   * Search transactions with pagination
   */
  searchTransactionsPaginated(
    request: TransactionSearchRequest,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<TransactionResponse>> {
    return this.http.post<PagedResponse<TransactionResponse>>(
      `${this.baseUrl}/search/paged?page=${page}&size=${size}`,
      request
    );
  }
}