import { Test, TestingModule } from '@nestjs/testing';
import { AdminAccountsController } from './admin-accounts.controller';

describe('AdminAccountsController', () => {
  let controller: AdminAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAccountsController],
    }).compile();

    controller = module.get<AdminAccountsController>(AdminAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
