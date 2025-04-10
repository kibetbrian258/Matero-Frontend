import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityTipsComponent } from './security-tips.component';

describe('SecurityTipsComponent', () => {
  let component: SecurityTipsComponent;
  let fixture: ComponentFixture<SecurityTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityTipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
