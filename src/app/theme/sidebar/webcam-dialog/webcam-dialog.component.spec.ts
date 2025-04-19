import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcamDialogComponent } from './webcam-dialog.component';

describe('WebcamDialogComponent', () => {
  let component: WebcamDialogComponent;
  let fixture: ComponentFixture<WebcamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebcamDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebcamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
