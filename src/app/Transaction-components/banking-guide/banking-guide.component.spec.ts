import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankingGuideComponent } from './banking-guide.component';

describe('BankingGuideComponent', () => {
  let component: BankingGuideComponent;
  let fixture: ComponentFixture<BankingGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankingGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
