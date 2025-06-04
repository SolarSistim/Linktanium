import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDropComponent } from './dashboard-drop.component';

describe('DashboardDropComponent', () => {
  let component: DashboardDropComponent;
  let fixture: ComponentFixture<DashboardDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
