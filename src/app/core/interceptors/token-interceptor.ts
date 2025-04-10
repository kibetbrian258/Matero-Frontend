import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@core/authentication';
import { catchError, tap, throwError } from 'rxjs';
import { BASE_URL, hasHttpScheme } from './base-url-interceptor';

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const baseUrl = inject(BASE_URL, { optional: true });
  const tokenService = inject(TokenService);

  // For debugging
  console.log('Request URL:', req.url);
  console.log('Token valid:', tokenService.valid());
  
  if (tokenService.valid()) {
    const token = tokenService.getBearerToken();
    console.log('Adding token:', token);
    
    // Clone the request with the Authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', token)
    });
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP request error:', error);
        
        if (error.status === 401) {
          console.log('401 error - clearing token and redirecting to login');
          tokenService.clear();
          router.navigateByUrl('/auth/login');
        }
        return throwError(() => error);
      })
    );
  }

  // No valid token, continue without Authorization header
  return next(req);
}