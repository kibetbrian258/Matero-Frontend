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
import { AuthService, CustomerProfile } from '@core';
import { CustomerService, UpdateProfileRequest } from '@core/authentication/customer.service';
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
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  loading = true;
  submitting = false;
  currentProfile: CustomerProfile | null = null;

  ngOnInit(): void {
    // Initialize the form
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[7|1][0-9]{8}$/)]],
      address: ['', [Validators.minLength(5), Validators.maxLength(200)]],
      dateOfBirth: [''],
    });

    // Load current profile data
    this.authService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.currentProfile = profile;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber ? this.extractKenyanPhoneNumber(profile.phoneNumber) : '',
          address: profile.address,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile', error);
        this.snackBar.open('Failed to load profile information. Please try again later.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  // Extract Kenyan phone number from +254 format
  private extractKenyanPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If number has country code (254), remove it
    if (digitsOnly.startsWith('254')) {
      return digitsOnly.substring(3);
    }
    
    return digitsOnly;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.submitting = true;
    const formValues = this.profileForm.value;
    
    // Only include fields that have been changed to minimize the request payload
    const updateRequest: UpdateProfileRequest = {};
    
    if (formValues.fullName !== this.currentProfile?.fullName) {
      updateRequest.fullName = formValues.fullName;
    }
    
    if (formValues.email !== this.currentProfile?.email) {
      updateRequest.email = formValues.email;
    }
    
    const currentPhone = this.currentProfile?.phoneNumber 
      ? this.extractKenyanPhoneNumber(this.currentProfile.phoneNumber) 
      : '';
      
    if (formValues.phoneNumber !== currentPhone) {
      updateRequest.phoneNumber = formValues.phoneNumber;
    }
    
    if (formValues.address !== this.currentProfile?.address) {
      updateRequest.address = formValues.address;
    }
    
    // Format date to YYYY-MM-DD
    const currentDate = this.currentProfile?.dateOfBirth;
    const newDate = formValues.dateOfBirth ? this.formatDateForApi(formValues.dateOfBirth) : undefined;
    
    if (newDate !== currentDate) {
      updateRequest.dateOfBirth = newDate;
    }
    
    // Only send the request if there are changes
    if (Object.keys(updateRequest).length === 0) {
      this.snackBar.open('No changes detected', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }
    
    this.customerService.updateProfile(updateRequest)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/profile/overview']);
        },
        error: (error) => {
          console.error('Error updating profile', error);
          this.snackBar.open(
            error.error?.message || 'Failed to update profile. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }
  
  private formatDateForApi(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
        dateOfBirth: this.currentProfile.dateOfBirth ? new Date(this.currentProfile.dateOfBirth) : null,
      });
    }
  }
}