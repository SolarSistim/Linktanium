import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallTitleComponent } from './small-title.component';

describe('SmallTitleComponent', () => {
  let component: SmallTitleComponent;
  let fixture: ComponentFixture<SmallTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
