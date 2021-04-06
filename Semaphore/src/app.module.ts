import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalGateway } from './signal.gateway';
import { SttServiceService } from './stt-service/stt-service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SignalGateway, SttServiceService],
})
export class AppModule {}
