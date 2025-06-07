import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogListComponent } from './dialog-list.component';

describe('DialogListComponent', () => {
  let component: DialogListComponent;
  let fixture: ComponentFixture<DialogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
