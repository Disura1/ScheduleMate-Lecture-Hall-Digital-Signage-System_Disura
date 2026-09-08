import { Test, TestingModule } from '@nestjs/testing';
import { SignageController } from './signage.controller';

describe('SignageController', () => {
  let controller: SignageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignageController],
    }).compile();

    controller = module.get<SignageController>(SignageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
