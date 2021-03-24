import {
  ConnectedSocket,
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
const streamToBlob = require('stream-to-blob')
// const { Converter } = require("ffmpeg-stream")
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// const ffmpeg = require('fluent-ffmpeg');

@WebSocketGateway({transports: ['websocket'], namespace: 'stream'})
export class StreamGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(){}

  server: Server;
  private logger: Logger = new Logger('StreamGateway');

  handleDisconnect(client: Socket) {
    this.logger.log('Disconnect', client.id);
  }

  handleError(error: any) {
    this.logger.log('Error', error);
  }

  handleConnection(client: Socket){
    this.logger.log('Connect', client.id)
    ss(client).on('stream', (stream,data)=> {
     this.handleStream(ss(client),stream, data)
    })

  }

  afterInit(server: Server) {
     this.logger.log('Server Initiated');
     this.server = ss(server);
  }



  @SubscribeMessage('event')
  handleEvent(@ConnectedSocket() client: Socket,@MessageBody() data: any) {
    this.logger.log('event Received', data);
    console.log('data', data);
    return 'event acknowledged';
  }

  @SubscribeMessage('stream')
  handleStream(client: any, stream: any, data: any) {
    this.speechToText(stream, (data)=>{
      console.log('hello',  data.results[0].alternatives[0]);
    })

    return 'stream acknowledged';
  }

  speechToText(stream, cb: Function){
    let sttRequest = {
      config: {
        sampleRateHertz: 16000,
        encoding: 'LINEAR16',
        languageCode: 'en-US',
      }
    }

    const recognizeStream = sttClient.streamingRecognize(sttRequest)
        .on('data', function(data: any){
          console.log('fuckind data', data.results[0].alternatives[0]);
          cb(data.results[0].alternatives[0]);
        })
        .on('error', (e: any) => {
          console.log('ERROR:', e);
        })
        .on('end', () => {
          console.log('on end');
        });

    stream.pipe(recognizeStream);
    stream.on('end',()=>{
      this.logger.log('STREAM ENDED');
    })
  }
}