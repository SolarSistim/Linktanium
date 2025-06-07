import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddListComponent } from './dialog-add-list.component';

describe('DialogAddListComponent', () => {
  let component: DialogAddListComponent;
  let fixture: ComponentFixture<DialogAddListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
