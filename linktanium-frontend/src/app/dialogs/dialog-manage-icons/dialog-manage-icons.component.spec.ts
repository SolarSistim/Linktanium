import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageIconsComponent } from './dialog-manage-icons.component';

describe('DialogManageIconsComponent', () => {
  let component: DialogManageIconsComponent;
  let fixture: ComponentFixture<DialogManageIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageIconsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
