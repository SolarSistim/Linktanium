import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedListItemsComponent } from './completed-list-items.component';

describe('CompletedListItemsComponent', () => {
  let component: CompletedListItemsComponent;
  let fixture: ComponentFixture<CompletedListItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedListItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedListItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
