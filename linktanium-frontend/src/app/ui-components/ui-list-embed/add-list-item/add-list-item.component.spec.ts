import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddListItemComponent } from './add-list-item.component';

describe('AddListItemComponent', () => {
  let component: AddListItemComponent;
  let fixture: ComponentFixture<AddListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
