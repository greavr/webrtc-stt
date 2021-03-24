import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
const ss = require('socket.io-stream');

import * as cors from 'cors';
import * as helmet from 'helmet';
import {WsAdapter} from "@nestjs/platform-ws";

// export class RedisIoAdapter extends IoAdapter {
//   createIOServer(port: number): any {
//     const server = super.createIOServer(port);
//     const redisIoAdapter = require( 'socket.io-redis')
//     const redisAdapter = redisIoAdapter({
//       host: process.env.REDIS_HOST,
//       port: process.env.REDIS_PORT,
//       auth_pass: process.env.REDIS_PASSWORD,
//     });
//     server.adapter(redisAdapter);
//     return server;
//   }
// }

export class StreamIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    return ss(server);
  }
}

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  // app.useWebSocketAdapter(new WsAdapter(app));
  app.useWebSocketAdapter(new IoAdapter(app));
  // app.useWebSocketAdapter(new StreamIoAdapter(app));
  // app.use(cors());
  // app.use(helmet());
  // app.useWebSocketAdapter(new RedisIoAdapter(app));

  // console.log('Port', process.env.PORT);
  await app.listen(8888);

  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
}

bootstrap();