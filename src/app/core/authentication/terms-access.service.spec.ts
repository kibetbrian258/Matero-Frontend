import { TestBed } from '@angular/core/testing';

import { TermsAccessService } from './terms-access.service';

describe('TermsAccessService', () => {
  let service: TermsAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermsAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
