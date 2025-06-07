import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditSingleCategoryComponent } from './dialog-edit-single-category.component';

describe('DialogEditSingleCategoryComponent', () => {
  let component: DialogEditSingleCategoryComponent;
  let fixture: ComponentFixture<DialogEditSingleCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditSingleCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditSingleCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
