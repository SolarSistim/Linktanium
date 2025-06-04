import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialANoteOnImportsComponent } from './tutorial-a-note-on-imports.component';

describe('TutorialANoteOnImportsComponent', () => {
  let component: TutorialANoteOnImportsComponent;
  let fixture: ComponentFixture<TutorialANoteOnImportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialANoteOnImportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialANoteOnImportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
