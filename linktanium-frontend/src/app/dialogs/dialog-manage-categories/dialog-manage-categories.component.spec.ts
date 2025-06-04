import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageCategoriesComponent } from './dialog-manage-categories.component';

describe('DialogManageCategoriesComponent', () => {
  let component: DialogManageCategoriesComponent;
  let fixture: ComponentFixture<DialogManageCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
