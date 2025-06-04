import { TestBed } from '@angular/core/testing';

import { UiStatusService } from './ui-status.service';

describe('UiStatusService', () => {
  let service: UiStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
