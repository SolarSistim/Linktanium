import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiListEmbedComponent } from './ui-list-embed.component';

describe('UiListEmbedComponent', () => {
  let component: UiListEmbedComponent;
  let fixture: ComponentFixture<UiListEmbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiListEmbedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiListEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
