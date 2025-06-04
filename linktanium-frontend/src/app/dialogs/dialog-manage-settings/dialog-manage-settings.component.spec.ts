import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageSettingsComponent } from './dialog-manage-settings.component';

describe('DialogManageSettingsComponent', () => {
  let component: DialogManageSettingsComponent;
  let fixture: ComponentFixture<DialogManageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
