import { Module } from '@nestjs/common';
import { OmsService } from './oms.service';
import { OmsController } from './oms.controller';

@Module({
  providers: [OmsService],
  controllers: [OmsController],
})
export class OmsModule {}
