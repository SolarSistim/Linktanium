import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiListComponent } from './ui-list.component';

describe('UiListComponent', () => {
  let component: UiListComponent;
  let fixture: ComponentFixture<UiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
