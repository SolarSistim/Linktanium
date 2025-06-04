import { Test, TestingModule } from '@nestjs/testing';
import { LinkCategoryController } from './link-categories.controller';

describe('LinkCategoryController', () => {
  let controller: LinkCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkCategoryController],
    }).compile();

    controller = module.get<LinkCategoryController>(LinkCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
