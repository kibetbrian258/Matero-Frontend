import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TermsAccessService } from './terms-access.service';

@Injectable({
  providedIn: 'root',
})
export class TermsAccessGuard implements CanActivate {
  private router = inject(Router);
  private termsAccessService = inject(TermsAccessService);

  canActivate(): boolean | UrlTree {
    // Check if access is allowed
    if (this.termsAccessService.isAccessAllowed()) {
      return true;
    }

    // Redirect to registration page if direct access attempted
    return this.router.createUrlTree(['/auth/register']);
  }
}
