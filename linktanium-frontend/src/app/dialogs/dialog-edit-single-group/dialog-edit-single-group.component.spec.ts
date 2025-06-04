import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditSingleGroupComponent } from './dialog-edit-single-group.component';

describe('DialogEditSingleGroupComponent', () => {
  let component: DialogEditSingleGroupComponent;
  let fixture: ComponentFixture<DialogEditSingleGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditSingleGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditSingleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
