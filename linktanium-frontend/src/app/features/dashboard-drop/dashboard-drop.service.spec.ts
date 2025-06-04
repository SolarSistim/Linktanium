import { TestBed } from '@angular/core/testing';

import { DashboardDropService } from './dashboard-drop.service';

describe('DashboardDropService', () => {
  let service: DashboardDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
