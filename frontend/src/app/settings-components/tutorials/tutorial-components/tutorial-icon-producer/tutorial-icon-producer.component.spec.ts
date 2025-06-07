import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialIconProducerComponent } from './tutorial-icon-producer.component';

describe('TutorialIconProducerComponent', () => {
  let component: TutorialIconProducerComponent;
  let fixture: ComponentFixture<TutorialIconProducerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialIconProducerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialIconProducerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
