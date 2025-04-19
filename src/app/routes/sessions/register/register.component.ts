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

  isLoading = false;
  registrationSuccess = false;

  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    dateOfBirth: ['', [Validators.required]],
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
}
