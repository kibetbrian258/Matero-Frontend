import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@core/authentication';
import { catchError, throwError } from 'rxjs';
import { BASE_URL } from './base-url-interceptor';

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const baseUrl = inject(BASE_URL, { optional: true });
  const tokenService = inject(TokenService);

  // Skip token for login requests
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  if (tokenService.valid()) {
    const token = tokenService.getBearerToken();
    console.log('Using token:', token.substring(0, 30) + '...');
    console.log('Token payload:', tokenService.getCustomerId());

    // Clone the request with the Authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token),
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is expired or invalid, redirect to login
          console.log('401 error - redirecting to login');
          tokenService.clear();
          router.navigateByUrl('/auth/login');
        }
        return throwError(() => error);
      })
    );
  }

  // No valid token, continue without Authorization header
  console.warn('Request without valid token:', req.url);
  return next(req);
}
