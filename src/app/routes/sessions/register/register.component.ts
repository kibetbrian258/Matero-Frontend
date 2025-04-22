import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, RegistrationRequest } from '@core/authentication/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TermsAccessService } from '@core/authentication/terms-access.service';

// Custom validator to check if user is at least 18 years old
export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birth month is in the future this year or
    // if birth month is the current month but day is in the future
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age < 18 ? { underage: true } : null;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  standalone: true,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly termsAccessService = inject(TermsAccessService);

  isLoading = false;
  registrationSuccess = false;

  // Calculate max date for datepicker (18 years ago from today)
  maxDate: Date = new Date();

  constructor() {
    // Set max date to 18 years ago
    const year = this.maxDate.getFullYear() - 18;
    const month = this.maxDate.getMonth();
    const day = this.maxDate.getDate();
    this.maxDate = new Date(year, month, day);
  }

  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    dateOfBirth: ['', [Validators.required, ageValidator()]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[7|1][0-9]{8}$/)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    termsAccepted: [false, [Validators.requiredTrue]],
  });

  submitRegistration() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });

      // Show error message if underage
      if (this.registerForm.get('dateOfBirth')?.hasError('underage')) {
        this.snackBar.open('You must be at least 18 years old to register.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }

      return;
    }

    this.isLoading = true;

    // Format the date to ISO string (YYYY-MM-DD format)
    const formValue = this.registerForm.value;
    const dateOfBirth = formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : null;

    const request: RegistrationRequest = {
      fullName: formValue.fullName || '',
      email: formValue.email || '',
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
      phoneNumber: formValue.phoneNumber || '',
      address: formValue.address || '',
    };

    this.authService
      .register(request)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          console.log('Registration successful', response);
          this.registrationSuccess = true;
          this.registerForm.reset();
        },
        error: error => {
          console.error('Registration failed', error);
          let errorMessage = 'Registration failed. Please try again.';

          if (error.error && typeof error.error === 'object') {
            // Handle structured error responses from the backend
            if (error.error.email) {
              errorMessage = error.error.email;
            } else if (error.error.phoneNumber) {
              errorMessage = error.error.phoneNumber;
            } else if (error.error.dateOfBirth) {
              errorMessage = error.error.dateOfBirth;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /**
   * Navigate to terms and conditions page
   * Grants access through the serve before navigation
   */

  navigateToTerms(event: Event): void {
    event.preventDefault();

    // Grant access through the service
    this.termsAccessService.grantAccess();
    this.router.navigateByUrl('/terms');
  }
}
