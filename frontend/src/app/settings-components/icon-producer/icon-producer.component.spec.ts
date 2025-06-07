import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconProducerComponent } from './icon-producer.component';

describe('IconProducerComponent', () => {
  let component: IconProducerComponent;
  let fixture: ComponentFixture<IconProducerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconProducerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconProducerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
