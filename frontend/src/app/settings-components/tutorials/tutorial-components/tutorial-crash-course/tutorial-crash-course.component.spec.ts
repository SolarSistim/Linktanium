import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialCrashCourseComponent } from './tutorial-crash-course.component';

describe('TutorialCrashCourseComponent', () => {
  let component: TutorialCrashCourseComponent;
  let fixture: ComponentFixture<TutorialCrashCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialCrashCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialCrashCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
