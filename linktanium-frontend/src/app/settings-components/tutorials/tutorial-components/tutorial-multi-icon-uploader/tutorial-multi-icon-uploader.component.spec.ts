import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialMultiIconUploaderComponent } from './tutorial-multi-icon-uploader.component';

describe('TutorialMultiIconUploaderComponent', () => {
  let component: TutorialMultiIconUploaderComponent;
  let fixture: ComponentFixture<TutorialMultiIconUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialMultiIconUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialMultiIconUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
