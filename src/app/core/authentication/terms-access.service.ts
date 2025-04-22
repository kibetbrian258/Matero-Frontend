import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TermsAccessService {
  private allowAccess = false;

  /**
   * Allow Acess to terms page
   */

  grantAccess(): void {
    this.allowAccess = true;
  }

  /**
   * Check if access to terms page is allowed
   * @returns boolean indicating if access is allowed
   */

  isAccessAllowed(): boolean {
    // if access is allowed, consume the permission (One-time-use)
    const currentAccess = this.allowAccess;
    if (this.allowAccess) {
      this.allowAccess = false;
    }
    return currentAccess;
  }
}
