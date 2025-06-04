import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialNoteOnIconsComponent } from './tutorial-note-on-icons.component';

describe('TutorialNoteOnIconsComponent', () => {
  let component: TutorialNoteOnIconsComponent;
  let fixture: ComponentFixture<TutorialNoteOnIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialNoteOnIconsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialNoteOnIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
