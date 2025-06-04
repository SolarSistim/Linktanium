import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeTitleComponent } from './large-title.component';

describe('LargeTitleComponent', () => {
  let component: LargeTitleComponent;
  let fixture: ComponentFixture<LargeTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LargeTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LargeTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
