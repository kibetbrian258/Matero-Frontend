import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, of } from 'rxjs';

import { Menu } from '@core';
import { Token, User } from './interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  protected readonly http = inject(HttpClient);

  login(customerId: string, pin: string, rememberMe = false) {
    console.log('Login request for customerId:', customerId);

    return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { customerId, pin }).pipe(
      map(response => {
        console.log('Login API response:', response);
        return {
          access_token: response.token,
          token_type: 'Bearer',
          expires_in: response.expiresIn || 86400, // Using 24 hours as default
          customerId: response.customerId,
        };
      })
    );
  }

  logout() {
    return of({});
  }

  user() {
    console.log('Fetching user profile from API');
    return this.http.get<any>(`${environment.apiUrl}/api/customers/profile`).pipe(
      map(profile => {
        console.log('Received user profile:', profile);
        return {
          id: profile.customerId,
          name: profile.fullName,
          email: profile.email,
          avatar: './assets/images/avatar.jpg',
        };
      })
    );
  }

  menu() {
    const menuItems: Menu[] = [
      {
        route: 'dashboard',
        name: 'Dashboard',
        type: 'link' as 'link',
        icon: 'dashboard',
      },
      {
        route: 'accounts',
        name: 'Account Information',
        type: 'link' as 'link',
        icon: 'account_balance',
      },
      {
        route: 'transactions',
        name: 'Transaction Management',
        type: 'link' as 'link',
        icon: 'payments',
      },
      {
        route: 'support',
        name: 'Help & Support',
        type: 'link' as 'link',
        icon: 'support_agent',
      },
    ];

    return of(menuItems);
  }
}
