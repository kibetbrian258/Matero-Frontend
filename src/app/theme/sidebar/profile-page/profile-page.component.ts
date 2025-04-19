import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CustomerProfile,
  ProfileService,
  UpdateProfileRequest,
} from '@core/authentication/profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ProfileImageComponent } from '../profile-image/profile-image.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ProfileImageComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  profileForm!: FormGroup;
  profile: CustomerProfile | null = null;
  loading = true;
  submitting = false;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern('^7[0-9]{8}$')]],
      address: ['', [Validators.maxLength(200)]],
      dateOfBirth: [null],
    });
  }

  loadProfile(): void {
    this.loading = true;

    this.profileService.getCustomerProfile().subscribe({
      next: data => {
        this.profile = data;

        // Format phone number to remove country code if present
        const phoneNumber = data.phoneNumber ? data.phoneNumber.replace(/^\+254/, '') : '';

        // update form with profile data
        this.profileForm.patchValue({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: phoneNumber,
          address: data.address,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        });

        // Reset form state
        this.profileForm.markAsPristine();
        this.loading = false;
      },

      error: error => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Failed to load profile. Please try again later.', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.profileForm.dirty) {
      return;
    }

    this.submitting = true;
    const formData = this.profileForm.value;

    // Prepare update request
    const updateRequest: UpdateProfileRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
    };

    // Add date of birth if present
    if (formData.dateOfBirth) {
      // Format date to ISO string (YYY-MM-DD)
      const date = new Date(formData.dateOfBirth);
      updateRequest.dateOfBirth = date.toISOString().split('T')[0];
    }

    this.profileService.updateCustomerProfile(updateRequest).subscribe({
      next: updatedProfile => {
        this.profile = updatedProfile;
        this.profileForm.markAsPristine();
        this.submitting = false;

        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
        });
      },

      error: error => {
        console.error('Error updating profile:', error);
        this.submitting = false;

        // Determine error message based on response
        let errorMessage = 'Failed to update profile. Please try again.';

        if (error.error && typeof error.error === 'object') {
          const firstErrorKey = Object.keys(error.error)[0];
          if (firstErrorKey && error.error[firstErrorKey]) {
            errorMessage = error.error[firstErrorKey];
          }
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  resetForm(): void {
    if (!this.profile) return;

    //Reset form to original values
    const phoneNumber = this.profile.phoneNumber
      ? this.profile.phoneNumber.replace(/^\+254/, '')
      : '';

    this.profileForm.patchValue({
      fullName: this.profile.fullName,
      email: this.profile.email,
      phoneNumber: phoneNumber,
      address: this.profile.address,
      dateOfBirth: this.profile.dateOfBirth ? new Date(this.profile.dateOfBirth) : null,
    });

    this.profileForm.markAsPristine();
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  }
}
