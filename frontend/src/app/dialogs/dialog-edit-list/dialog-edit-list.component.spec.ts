import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditListComponent } from './dialog-edit-list.component';

describe('DialogEditListComponent', () => {
  let component: DialogEditListComponent;
  let fixture: ComponentFixture<DialogEditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
