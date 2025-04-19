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

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/customers`;

  /**
   * Get the authenticated customer's profile
   */
  getProfile(): Observable<CustomerProfileResponse> {
    return this.http.get<CustomerProfileResponse>(`${this.baseUrl}/profile`);
  }

  /**
   * Update the authenticated customer's profile
   */
  updateProfile(request: UpdateProfileRequest): Observable<CustomerProfileResponse> {
    return this.http.put<CustomerProfileResponse>(`${this.baseUrl}/profile`, request);
  }
}
