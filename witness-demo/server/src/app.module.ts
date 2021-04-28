import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalGateway } from './wss/signal.gateway';
import { SttService } from './stt-service/stt-service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SignalGateway, SttService],
})
export class AppModule {}
