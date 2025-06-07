import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiStatusComponent } from './ui-status.component';

describe('UiStatusComponent', () => {
  let component: UiStatusComponent;
  let fixture: ComponentFixture<UiStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
