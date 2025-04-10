import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/authentication/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
    TranslateModule,
  ],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastrService);

  isSubmitting = false;
  returnUrl: string = '/';

  loginForm = this.fb.nonNullable.group({
    customerId: ['', [Validators.required]],
    pin: ['', [Validators.required]],
    rememberMe: [false],
  });

  ngOnInit() {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get customerId() {
    return this.loginForm.get('customerId')!;
  }

  get pin() {
    return this.loginForm.get('pin')!;
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe')!;
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.auth
      .login(this.customerId.value, this.pin.value, this.rememberMe.value)
      .pipe(filter(authenticated => authenticated))
      .subscribe({
        next: () => {
          this.toast.success('Login successful');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (errorRes: HttpErrorResponse) => {
          console.error('Login error:', errorRes);

          if (errorRes.status === 401) {
            this.toast.error('Invalid credentials. Please check your Customer ID and PIN.');
          } else if (errorRes.status === 422 && errorRes.error?.errors) {
            const form = this.loginForm;
            const errors = errorRes.error.errors;
            Object.keys(errors).forEach(key => {
              form.get(key === 'customerId' ? 'customerId' : key)?.setErrors({
                remote: errors[key][0],
              });
            });
          } else {
            this.toast.error('Login failed. Please try again later.');
          }

          this.isSubmitting = false;
        },
      });
  }
}
