import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

declare const module: any;
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './asset/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, './asset/cert.pem')),
  passphrase: 'panda',
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(8888);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
