import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SttService } from './stt-service/stt-service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const speech = require('@google-cloud/speech');
const sttClient = new speech.SpeechClient();

@WebSocketGateway({ transports: ['websocket'], namespace: 'signal' })
export class SignalGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  private logger: Logger = new Logger('SignalGateway');
  private sttService: SttService = new SttService();

  @WebSocketServer()
  server: Server;

  afterInit(server: any): any {
    this.logger.log('Signal Server Initialized');
  }

  handleConnection(client: Socket, ...args): any {
    this.logger.log('Connect', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Disconnect', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: Options) {
    try {
      client.join(data.room);
      this.logger.log(`${data.user} join the ${data.room}`);
    } catch (e) {
      console.log('error', e);
      return `Unable to join the ${data.room}`;
    }
  }

  @SubscribeMessage('leave')
  async handleLeave(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      // @ToDo - Clean this up?
      await client.leave(Object.keys(client.rooms)[1]);
    } catch (e) {
      console.log('Unable to leave the room', e);
    }
  }

  @SubscribeMessage('candidate')
  handleCandidate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      // @ToDo - Clean this up?
      client.broadcast
        .to(Object.keys(client.rooms)[1])
        .emit('message', { candidate: data.candidate });
    } catch (e) {
      console.log('Unable to leave the room', e);
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    client.broadcast
      .to(Object.keys(client.rooms)[1])
      .emit('message', { offer: data.offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    client.broadcast
      .to(Object.keys(client.rooms)[1])
      .emit('message', { answer: data.answer });
  }

  @SubscribeMessage('media')
  handleMedia(
    @ConnectedSocket() client: Socket,
    @MessageBody() stream: any,
  ): void {
    console.log('MEDIA');
    this.sttService.speechToText(stream, (data) => {
      console.log('hello', data);
      console.log('otherHello', data.results[0].alternatives[0]);
    });
  }
}

interface Options {
  room: string;
  user: string;
}
