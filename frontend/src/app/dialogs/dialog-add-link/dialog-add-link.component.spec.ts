import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddLinkComponent } from './dialog-add-link.component';

describe('DialogAddLinkComponent', () => {
  let component: DialogAddLinkComponent;
  let fixture: ComponentFixture<DialogAddLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
