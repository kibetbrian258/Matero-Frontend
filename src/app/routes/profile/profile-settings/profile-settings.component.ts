import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import {
  CustomerProfile,
  ProfileService,
  UpdateProfileRequest,
} from '@core/authentication/profile.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    AsyncPipe,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  loading = true;
  submitting = false;
  currentProfile: CustomerProfile | null = null;

  // Update pattern to match backend ValidKenyanPhone validator
  // This matches a digit 7 or 1 followed by exactly 8 digits
  // The ^ and $ ensure we match the entire string, not just part of it
  private readonly KENYAN_PHONE_PATTERN = /^(7|1)\d{8}$/;

  ngOnInit(): void {
    // Initialize the form with proper validators
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      // Make phone number optional but validate format if provided
      phoneNumber: ['', [Validators.pattern(this.KENYAN_PHONE_PATTERN)]],
      address: ['', [Validators.minLength(5), Validators.maxLength(200)]],
      dateOfBirth: [''],
    });

    // Load current profile data
    this.profileService.getCustomerProfile().subscribe({
      next: profile => {
        this.currentProfile = profile;

        // Extract phone number for display - removing the +254 prefix
        const displayPhoneNumber = profile.phoneNumber
          ? this.extractKenyanPhoneNumber(profile.phoneNumber)
          : '';

        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: displayPhoneNumber,
          address: profile.address,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        });
        this.loading = false;
      },
      error: error => {
        this.snackBar.open('Failed to load profile information. Please try again later.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  // Extracts the significant part of a Kenyan phone number
  private extractKenyanPhoneNumber(phone: string): string {
    if (!phone) return '';

    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // If number has country code (254), remove it
    if (digitsOnly.startsWith('254')) {
      return digitsOnly.substring(3);
    }

    // If number starts with 0, remove it
    if (digitsOnly.startsWith('0')) {
      return digitsOnly.substring(1);
    }

    // If it already starts with 7 or 1 and has 9 digits, return as is
    if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
      return digitsOnly;
    }

    return digitsOnly;
  }

  // Checks if a phone number follows the required format
  private isValidKenyanPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    return this.KENYAN_PHONE_PATTERN.test(phone);
  }

  onSubmit(): void {
    // Check if phone number is invalid but has a value
    const phoneControl = this.profileForm.get('phoneNumber');
    if (phoneControl?.invalid && phoneControl?.value !== '' && phoneControl?.value !== null) {
      phoneControl.markAsTouched();
      this.snackBar.open(
        'Phone number must start with 7 or 1 followed by 8 digits (e.g. 712345678)',
        'Close',
        {
          duration: 5000,
        }
      );
      return;
    }

    // Check other form validations
    if (this.profileForm.invalid) {
      // Mark all fields as touched to display validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    this.submitting = true;
    const formValues = this.profileForm.value;

    // Create the update request with changed fields only
    const updateRequest: UpdateProfileRequest = {};

    if (formValues.fullName && formValues.fullName !== this.currentProfile?.fullName) {
      updateRequest.fullName = formValues.fullName;
    }

    if (formValues.email && formValues.email !== this.currentProfile?.email) {
      updateRequest.email = formValues.email;
    }

    // Phone number handling - always include the current value to allow other fields to update
    const phoneValue = phoneControl?.value;
    if (phoneValue) {
      // Ensure the phone number is in a valid format before including it
      if (this.isValidKenyanPhoneNumber(phoneValue)) {
        updateRequest.phoneNumber = phoneValue;
      } else {
        this.submitting = false;
        this.snackBar.open(
          'Phone number must start with 7 or 1 followed by 8 digits (e.g. 712345678)',
          'Close',
          {
            duration: 5000,
          }
        );
        return;
      }
    }

    if (formValues.address !== this.currentProfile?.address) {
      updateRequest.address = formValues.address;
    }

    // Handle date of birth
    if (formValues.dateOfBirth) {
      const formattedDate = this.formatDateForApi(formValues.dateOfBirth);
      const currentDate = this.currentProfile?.dateOfBirth || '';

      if (formattedDate !== currentDate) {
        updateRequest.dateOfBirth = formattedDate;
      }
    }

    // Only send the request if there are changes
    if (Object.keys(updateRequest).length === 0) {
      this.snackBar.open('No changes detected', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    this.profileService
      .updateCustomerProfile(updateRequest)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: response => {
          // Update local profile data
          this.currentProfile = response;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/profile/overview']);
        },
        error: error => {
          // Extract meaningful error message
          let errorMessage = 'Failed to update profile. Please try again.';

          if (error.error && typeof error.error === 'object') {
            // Try to extract field-specific errors
            if (error.error.phoneNumber) {
              errorMessage = error.error.phoneNumber;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else {
              // Build error message from available fields
              const fieldErrors = [];
              for (const field in error.error) {
                if (typeof error.error[field] === 'string') {
                  fieldErrors.push(`${field}: ${error.error[field]}`);
                }
              }

              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join(', ');
              }
            }
          }

          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        },
      });
  }

  private formatDateForApi(date: Date | string | null): string {
    if (!date) return '';

    // Ensure we're working with a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    // Format as YYYY-MM-DD for the API
    return dateObj.toISOString().split('T')[0];
  }

  resetForm(): void {
    if (this.currentProfile) {
      this.profileForm.patchValue({
        fullName: this.currentProfile.fullName,
        email: this.currentProfile.email,
        phoneNumber: this.currentProfile.phoneNumber
          ? this.extractKenyanPhoneNumber(this.currentProfile.phoneNumber)
          : '',
        address: this.currentProfile.address,
        dateOfBirth: this.currentProfile.dateOfBirth
          ? new Date(this.currentProfile.dateOfBirth)
          : null,
      });
    }
  }
}
