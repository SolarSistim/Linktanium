import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNameThemeComponent } from './dialog-name-theme.component';

describe('DialogNameThemeComponent', () => {
  let component: DialogNameThemeComponent;
  let fixture: ComponentFixture<DialogNameThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNameThemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogNameThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
