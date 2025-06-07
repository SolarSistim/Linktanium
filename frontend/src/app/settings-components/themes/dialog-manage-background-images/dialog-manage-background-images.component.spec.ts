import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageBackgroundImagesComponent } from './dialog-manage-background-images.component';

describe('DialogManageBackgroundImagesComponent', () => {
  let component: DialogManageBackgroundImagesComponent;
  let fixture: ComponentFixture<DialogManageBackgroundImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageBackgroundImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageBackgroundImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
