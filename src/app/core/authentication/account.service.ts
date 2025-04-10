import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

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

export interface CreateAccountRequest {
  accountType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/accounts`;

  /**
   * Get all accounts for the authenticated customer
   */
  getAccounts(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(this.baseUrl);
  }

  /**
   * Get details for a specific account
   */
  getAccountDetails(accountNumber: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.baseUrl}/${accountNumber}`);
  }

  /**
   * Create a new account with the specified type (savings or checking)
   */
  createAccount(accountType: string): Observable<AccountResponse> {
    const request: CreateAccountRequest = { accountType };
    return this.http.post<AccountResponse>(`${this.baseUrl}/create`, request);
  }
}