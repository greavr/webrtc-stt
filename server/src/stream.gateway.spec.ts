import { Test, TestingModule } from '@nestjs/testing';
import { StreamGateway } from './stream.gateway';

describe('StreamGateway', () => {
  let gateway: StreamGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamGateway],
    }).compile();

    gateway = module.get<StreamGateway>(StreamGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
