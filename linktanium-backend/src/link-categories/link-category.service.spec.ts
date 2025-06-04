import { Test, TestingModule } from '@nestjs/testing';
import { LinkCategoryService } from './link-categories.service';

describe('LinkCategoryService', () => {
  let service: LinkCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkCategoryService],
    }).compile();

    service = module.get<LinkCategoryService>(LinkCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
