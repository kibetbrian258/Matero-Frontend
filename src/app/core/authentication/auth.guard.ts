import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Store the attempted URL for redirecting after login
  const url = state.url;
  
  // Check if user is authenticated
  if (auth.check()) {
    return true;
  }
  
  // Not logged in, redirect to login page with return URL
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: url }
  });
  
  return false;
};