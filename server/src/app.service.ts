import { Injectable } from '@nestjs/common';
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sendToGoogle(){

  }
}
