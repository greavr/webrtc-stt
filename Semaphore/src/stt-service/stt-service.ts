import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const speech = require('@google-cloud/speech');
const sttClient = new speech.SpeechClient();

@Injectable()
export class SttService {
  private logger: Logger = new Logger('sttService');

  speechToText(stream, cb) {
    const sttRequest = {
      config: {
        sampleRateHertz: 16000,
        encoding: 'LINEAR16',
        languageCode: 'en-US',
      },
    };

    const recognizeStream = sttClient
      .streamingRecognize(sttRequest)
      .on('data', (data) => {
        console.log('received data', data.results[0].alternatives[0]);
	// write to file hereish
        cb(data.results[0].alternatives[0]);
      })
      .on('error', (e: any) => {
        console.log('ERROR:', e);
      })
      .on('end', () => {
        //console.log('stream end')
      });

    stream.pipe(recognizeStream);
    stream.on('end', () => {
      //this.logger.log('STREAM ENDED');
    });
  }
}
