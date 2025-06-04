import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialSearchBarComponent } from './tutorial-search-bar.component';

describe('TutorialSearchBarComponent', () => {
  let component: TutorialSearchBarComponent;
  let fixture: ComponentFixture<TutorialSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialSearchBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
