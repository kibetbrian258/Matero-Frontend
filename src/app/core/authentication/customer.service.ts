import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CustomerProfileResponse {
  customerId: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber: string;
  dateOfBirth?: string;
  registrationDate: string;
  lastLogin: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/customers`;

  /**
   * Get the authenticated customer's profile
   *
   * Note: For profile management including updates, please use ProfileService
   */
  getProfile(): Observable<CustomerProfileResponse> {
    return this.http.get<CustomerProfileResponse>(`${this.baseUrl}/profile`);
  }

  // Other customer-specific operations can be added here
  // - getCustomerAccounts()
  // - getCustomerTransactions()
  // - getCustomerStatements()
}
