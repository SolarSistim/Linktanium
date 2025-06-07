import { TestBed } from '@angular/core/testing';

import { ManageIconsService } from './manage-icons.service';

describe('ManageIconsService', () => {
  let service: ManageIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
