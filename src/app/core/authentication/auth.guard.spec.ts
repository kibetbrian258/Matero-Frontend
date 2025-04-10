import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSnapshot: ActivatedRouteSnapshot;
  let stateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['check']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    routeSnapshot = {} as ActivatedRouteSnapshot;
    stateSnapshot = { url: '/protected-route' } as RouterStateSnapshot;
  });

  it('should allow access when user is authenticated', () => {
    authServiceSpy.check.and.returnValue(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard(routeSnapshot, stateSnapshot);
      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to login when user is not authenticated', () => {
    authServiceSpy.check.and.returnValue(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard(routeSnapshot, stateSnapshot);
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/protected-route' },
      });
    });
  });
});
