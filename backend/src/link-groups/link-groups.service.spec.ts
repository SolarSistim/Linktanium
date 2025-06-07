import { Test, TestingModule } from '@nestjs/testing';
import { LinkGroupsService } from './link-groups.service';

describe('LinkGroupsService', () => {
  let service: LinkGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkGroupsService],
    }).compile();

    service = module.get<LinkGroupsService>(LinkGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
