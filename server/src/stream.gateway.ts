import {
  MessageBody, OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
const speech = require('@google-cloud/speech');
const sttClient = new speech.SpeechClient();
const ss = require('socket.io-stream');
import * as ReadableStream from 'readable-stream'

@WebSocketGateway({transports: ['websocket']})
export class StreamGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(){}
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('StreamGateway');

  handleDisconnect(client: Socket) {
    this.logger.log('Disconnect', client.id);
  }

  handleConnection(client: Socket){
    this.logger.log('Connect', client.id)
  }

  afterInit(server: Server) {
     this.logger.log('Server Initiated');
  }

  @SubscribeMessage('event')
  handleEvent(client: Socket,@MessageBody() data: any) {
    this.logger.log('event Received', data);
    console.log('data', data);
    return 'event acknowledged';
  }

  @SubscribeMessage('stream')
  handleStream(client: Socket,@MessageBody() data: any) {
    console.log('FAILS HERE');
    console.log('apsdfojh', data[0].readable)
    // console.log('fuckin client', client);
    // console.log('stream', data);
    // console.log(data[0].readable);
    // let stream: ReadableStream = new ReadableStream();
    // st
    console.log('stream \n', new ReadableStream());
    // console.log('blob', data.blob);
    // let thing = (data as ReadableStream);
    // console.log('thing', thing);
    // console.log('data', data[0]);
    // let blob = new Blob(data, }t
    // this.logger.log('stream Received', data);
    // const request = {config:{
    //     encoding: 'mp3',
    //     sampleRateHertz: 44100,
    //     languageCode: 'en-US'
    //   },
    //   interimResults: false,
    // }
    // let recognizeStream = sttClient.streamingRecognize(request)
    //     .on('error', () => this.logger.log('Error in STT'))
    //     .on('data', data => {
    //      return data.results[0].alternatives[0];
    //     });
    // // ss.createBlobReadStream(data).pipe(recognizeStream);
    //   data[0].pipe(recognizeStream);
    // data[0].on('end', (end) => {
    //   console.log('it has finished')
    // })

    this.speechToText(data[0], (text) => {
      this.logger.log('TEXT', text.transcript);
      client.emit('transcript', text.transcript);

    })
    return 'event acknowledged';
  }

  speechToText(stream, cb: Function){
    // console.log('stram', stream);
    console.log('stt stream', stream);

    let sttRequest = {
      config: {
        sampleRateHertz: 44100,
        encoding: 'mp3',
        languageCode: 'en-US',
        // enableAutomaticPunctuation: true,
        //nableSpeakerDiarization: true,
        //diarizationSpeakerCount: 2,
        // useEnhanced: true,
        // model: 'default',
        // metadata: {
        //   microphoneDistance: 'NEARFIELD', //MIDFIELD
        //   interactionType: 'VOICE_SEARCH',
        //   audioTopic: 'Airport FAQ'
        // }
      }
    }

    const recognizeStream = sttClient.streamingRecognize(sttRequest)
        .on('data', function(data: any){
          cb(data.results[0].alternatives[0]);
        })
        .on('error', (e: any) => {
          console.log('ERROR:', e);
        })
        .on('end', () => {
          console.log('on end');
        });

    stream.pipes(recognizeStream);
    stream.on('end', function() {
      //fileWriter.end();
    });
  }
}