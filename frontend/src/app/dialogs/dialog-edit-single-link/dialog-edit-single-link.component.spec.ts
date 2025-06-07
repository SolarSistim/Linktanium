import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditSingleLinkComponent } from './dialog-edit-single-link.component';

describe('DialogEditSingleLinkComponent', () => {
  let component: DialogEditSingleLinkComponent;
  let fixture: ComponentFixture<DialogEditSingleLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditSingleLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditSingleLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
