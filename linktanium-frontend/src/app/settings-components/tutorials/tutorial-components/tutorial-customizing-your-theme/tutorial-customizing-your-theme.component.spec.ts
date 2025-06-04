import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialCustomizingYourThemeComponent } from './tutorial-customizing-your-theme.component';

describe('TutorialCustomizingYourThemeComponent', () => {
  let component: TutorialCustomizingYourThemeComponent;
  let fixture: ComponentFixture<TutorialCustomizingYourThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialCustomizingYourThemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialCustomizingYourThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
