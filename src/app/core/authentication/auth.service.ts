import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  iif,
  map,
  of,
  share,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '@env/environment';
import { filterObject, isEmptyObject } from './helpers';
import { User } from './interface';
import { LoginService } from './login.service';
import { TokenService } from './token.service';

export interface RegistrationRequest {
  fullName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
}

export interface RegistrationResponse {
  customerId: string;
  pin: string;
  fullName: string;
  email: string;
  accountNumber: string;
}

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  registrationDate: string;
  lastLogin: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginService = inject(LoginService);
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  private customerProfileUrl = `${environment.apiUrl}/api/customers/profile`;

  private user$ = new BehaviorSubject<User>({});
  private change$ = this.tokenService.change().pipe(
    switchMap(() => this.assignUser()),
    share()
  );

  init() {
    return new Promise<void>(resolve => {
      this.change$.subscribe(() => {
        resolve();
      });
    });
  }

  change() {
    return this.change$;
  }

  check() {
    return this.tokenService.valid();
  }

  login(customerId: string, pin: string, rememberMe = false) {
    console.log('Login attempt for:', customerId);
    return this.loginService.login(customerId, pin, rememberMe).pipe(
      tap(token => {
        console.log('Login response token:', token);
        this.tokenService.set(token);
      }),
      map(() => this.check())
    );
  }

  getCustomerProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(this.customerProfileUrl).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout() {
    // Clear both keys to handle any historical tokens
    localStorage.removeItem('ng-matero-token');
    localStorage.removeItem('secure-bank-token');
    // Call the backend to log out
    if (this.check()) {
      return this.http.post(`${environment.apiUrl}/api/auth/logout`, {}).pipe(
        finalize(() => {
          // Clear tokens from storage
          this.tokenService.clear();
        }),
        catchError(error => {
          console.error('Error during logout:', error);
          // Still clear the local tokens even if backend logout fails
          this.tokenService.clear();
          return of(true);
        }),
        map(() => true)
      );
    } else {
      // No valid token, just clear local state
      this.tokenService.clear();
      return of(true);
    }
  }

  user() {
    return this.user$.pipe(share());
  }

  menu() {
    return iif(() => this.check(), this.loginService.menu(), of([]));
  }

  /**
   * Register a new customer
   * @param request Registration request data
   * @returns Observable of registration response
   */
  register(request: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${environment.apiUrl}/api/auth/register`, request);
  }

  private assignUser() {
    if (!this.check()) {
      return of({}).pipe(tap(user => this.user$.next(user)));
    }

    if (!isEmptyObject(this.user$.getValue())) {
      return of(this.user$.getValue());
    }

    return this.loginService.user().pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return of({});
      }),
      tap(user => this.user$.next(user))
    );
  }
}
