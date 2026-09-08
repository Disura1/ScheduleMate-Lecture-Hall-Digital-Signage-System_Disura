import { Test, TestingModule } from '@nestjs/testing';
import { SignageService } from './signage.service';

describe('SignageService', () => {
  let service: SignageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignageService],
    }).compile();

    service = module.get<SignageService>(SignageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
