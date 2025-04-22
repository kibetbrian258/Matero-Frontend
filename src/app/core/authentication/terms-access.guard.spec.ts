import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { termsAccessGuard } from './terms-access.guard';


describe('termsAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => termsAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
