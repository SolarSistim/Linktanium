import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorCurrentlyFilteringComponent } from './indicator-glow.component';

describe('IndicatorCurrentlyFilteringComponent', () => {
  let component: IndicatorCurrentlyFilteringComponent;
  let fixture: ComponentFixture<IndicatorCurrentlyFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorCurrentlyFilteringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorCurrentlyFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
