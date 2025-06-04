import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageLinksComponent } from './dialog-manage-links.component';

describe('DialogManageLinksComponent', () => {
  let component: DialogManageLinksComponent;
  let fixture: ComponentFixture<DialogManageLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
