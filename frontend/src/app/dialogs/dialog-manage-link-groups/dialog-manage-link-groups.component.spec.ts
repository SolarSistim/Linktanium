import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageLinkGroupsComponent } from './dialog-manage-link-groups.component';

describe('DialogManageLinkGroupsComponent', () => {
  let component: DialogManageLinkGroupsComponent;
  let fixture: ComponentFixture<DialogManageLinkGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogManageLinkGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogManageLinkGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
