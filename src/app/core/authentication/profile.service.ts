import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';
import { AppConstants } from '@core/constants/app-contants';

export interface ProfileImageResponse {
  imageData: string;
  contentType: string;
  lastUpdated: string;
}

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  registrationDate: string;
  lastLogin: string;
  profileImage?: string;
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
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private defaultImageUrl = AppConstants.Assets.DefaultAvatar;

  // Add a BehaviorSubject to track profile image changes
  private profileImageSubject = new BehaviorSubject<string | null>(null);
  public profileImage$ = this.profileImageSubject.asObservable();

  // Profile image endpoints
  getProfileImage(): Observable<ProfileImageResponse> {
    console.log('Fetching profile image from:', `${this.apiUrl}/api/profile/image`);

    return this.http.get<ProfileImageResponse>(`${this.apiUrl}/api/profile/image`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn('Profile image fetch error:', error);

        // Return default image data on error
        return of({
          imageData: '', // Empty string - component will use default
          contentType: 'image/png',
          lastUpdated: new Date().toISOString(),
        });
      })
    );
  }

  // Method to refresh and broadcast profile image changes
  refreshProfileImage(): void {
    this.getProfileImage().subscribe({
      next: response => {
        if (response && response.imageData && response.imageData.length > 0) {
          this.profileImageSubject.next(response.imageData);
        } else {
          this.profileImageSubject.next(null);
        }
      },
      error: () => {
        this.profileImageSubject.next(null);
      },
    });
  }

  uploadProfileImage(file: File): Observable<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading profile image to:', `${this.apiUrl}/api/profile/image`);

    return this.http.post<ProfileImageResponse>(`${this.apiUrl}/api/profile/image`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Profile image upload error:', error);

        // Return error observable while still allowing component to handle it
        return of({
          imageData: '',
          contentType: 'image/png',
          lastUpdated: new Date().toISOString(),
        });
      })
    );
  }

  // Customer profile endpoints
  getCustomerProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.apiUrl}/api/customers/profile`).pipe(
      catchError(error => {
        console.error('Error fetching customer profile:', error);
        throw error;
      })
    );
  }

  updateCustomerProfile(profile: UpdateProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.apiUrl}/api/customers/profile`, profile).pipe(
      catchError(error => {
        console.error('Error updating customer profile:', error);
        throw error;
      })
    );
  }

  /**
   * Delete the profile image for the authenticated user
   */
  deleteProfileImage(): Observable<ProfileImageResponse> {
    return this.http.delete<ProfileImageResponse>(`${this.apiUrl}/api/profile/image`);
  }
}
