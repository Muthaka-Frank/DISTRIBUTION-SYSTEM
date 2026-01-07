import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OmsModule } from './oms/oms.module';
import { WmsModule } from './wms/wms.module';
import { TmsModule } from './tms/tms.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, OmsModule, WmsModule, TmsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
