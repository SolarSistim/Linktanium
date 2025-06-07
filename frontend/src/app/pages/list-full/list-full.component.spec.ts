import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFullComponent } from './list-full.component';

describe('ListFullComponent', () => {
  let component: ListFullComponent;
  let fixture: ComponentFixture<ListFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFullComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
