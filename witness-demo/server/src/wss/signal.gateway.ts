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
import { PeerService } from './peer.services';
import { SttService } from '../stt-service/stt-service';
import { RTCSessionDescription } from 'wrtc';
// eslint-disable-next-line @typescript-eslint/no-var-requires

const ss = require('socket.io-stream');

@WebSocketGateway({ transports: ['websocket'], namespace: 'signal' })
export class SignalGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  private logger: Logger = new Logger('SignalGateway');
  private sttService: SttService = new SttService();
  private peerService: PeerService = new PeerService();
  pairs = [];

  @WebSocketServer()
  server: Server;

  afterInit(server: any): any {
    this.logger.log('Signal Server Initialized');
  }

  handleConnection(client: Socket, ...args): any {
    this.logger.log('Connect', client.id);
    ss(client).on('media', (stream, data) => {
      this.handleMedia(client, stream, data);
    });
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Disconnect', client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: Options) {
    try {
      client.join(data.room);
      this.logger.log(`${data.user} join the ${data.room}`);
      const peer = await this.peerService.newPeer();
      this.pairs.push({ id: [client.id], peer: await peer });
    } catch (e) {
      console.log('error', e);
      return `Unable to join the ${data.room}`;
    }
  }

  @SubscribeMessage('leave')
  async handleLeave(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      await client.leave(Object.keys(client.rooms)[1]);
    } catch (e) {
      console.log('Unable to leave the room', e);
    }
  }

  @SubscribeMessage('candidate')
  async handleCandidate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      // @ToDo - Clean this up?
      console.log('candidate found');
      const peer = await this.pairs.find((x) => x.id == client.id).peer;
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          client.emit('message', { candidate: event.candidate});
        }
      };
      await peer.addIceCandidate(data.candidate);
    } catch (e) {
      console.log('Unable to leave the room', e);
    }
  }
  @SubscribeMessage('offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const peer = await this.pairs.find((x) => x.id == client.id).peer;
    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    client.emit('message', { answer: answer });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    console.log('answer received');
    client.emit('message', { answer: data.answer });
  }

  @SubscribeMessage('media')
  handleMedia(@ConnectedSocket() client: Socket, stream: any, data: any): void {
    this.sttService.speechToText(stream, (data) => {
      if (data.confidence > 65) {
        client.broadcast
          .to(Object.keys(client.rooms)[1])
          .emit('message', { log: data.transcript });
      }
    });
  }
}

interface Options {
  room: string;
  user: string;
}
