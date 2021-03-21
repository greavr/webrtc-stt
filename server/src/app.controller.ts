import {Controller, Get, Post, Req} from '@nestjs/common';
import { AppService } from './app.service';
import speech from '@google-cloud/speech';
import { Request } from 'express';

@Controller()
export class AppController {
  client;
  constructor(private readonly appService: AppService) {
    this.client = new speech.SpeechClient();
  }

  @Get('test')
  async getHello() {
    const gcsUri = 'gs://cloud-samples-data/speech/brooklyn_bridge.raw';

    const audio = {
      uri: gcsUri,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };
    // Detects speech in the audio file
    // @ts-ignore
    const [response] = await this.client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log(`Transcription: ${transcription}`);

    return 'FUCK YES';
  }

  @Post('test')
  async getSHit(@Req() body: Request) {
    console.log('fuckin shit', body);
    // const audio = {
    //   uri: this.gcsUri,
    // };
    // const config = {
    //   encoding: 'LINEAR16',
    //   sampleRateHertz: 16000,
    //   languageCode: 'en-US',
    // };
    // const request = {
    //   audio: audio,
    //   config: config,
    // };
    // const client = new speech.SpeechClient();
    // // Detects speech in the audio file
    // // @ts-ignore
    // const [response] = await this.client.recognize(request);
    // const transcription = response.results
    //     .map(result => result.alternatives[0].transcript)
    //     .join('\n');
    // console.log(`Transcription: ${transcription}`);

    return 'FUCK YES';
  }
}
