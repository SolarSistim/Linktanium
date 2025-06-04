import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLinkGroupComponent } from './ui-link-group.component';

describe('UiLinkGroupComponent', () => {
  let component: UiLinkGroupComponent;
  let fixture: ComponentFixture<UiLinkGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLinkGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiLinkGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
