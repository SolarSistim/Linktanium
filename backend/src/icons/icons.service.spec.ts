import { Test, TestingModule } from '@nestjs/testing';
import { IconService } from './icons.service';

describe('IconService', () => {
  let service: IconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IconService],
    }).compile();

    service = module.get<IconService>(IconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
