import { Test, TestingModule } from '@nestjs/testing';
import { OmsController } from './oms.controller';

describe('OmsController', () => {
  let controller: OmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OmsController],
    }).compile();

    controller = module.get<OmsController>(OmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
