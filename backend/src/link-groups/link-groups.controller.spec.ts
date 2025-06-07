import { Test, TestingModule } from '@nestjs/testing';
import { LinkGroupsController } from './link-groups.controller';

describe('LinkGroupsController', () => {
  let controller: LinkGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkGroupsController],
    }).compile();

    controller = module.get<LinkGroupsController>(LinkGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
