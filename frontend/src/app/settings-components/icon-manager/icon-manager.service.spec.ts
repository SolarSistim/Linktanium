import { TestBed } from '@angular/core/testing';

import { IconManagerService } from './icon-manager.service';

describe('IconManagerService', () => {
  let service: IconManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
