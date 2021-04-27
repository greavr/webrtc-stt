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
import { SttService } from '../stt-service/stt-service';
import { PeerService } from './peer.service';
import { RTCPeerConnection, RTCSessionDescription } from 'wrtc';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const speech = require('@google-cloud/speech');
const sttClient = new speech.SpeechClient();
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
      this.handleMedia(client, stream, data)
    })
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('Disconnect', client.id);
  }

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: Options) {
    try {
      client.join(data.room);
      let peer = await this.peerService.newPeer();
      this.pairs.push({id:[client.id], peer: await peer})
      this.logger.log(`${data.user} join the ${data.room}`);
      //let offer = await this.peerService.newOffer(peer);
      //client.emit('message', {offer: await offer});
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
    let peer = this.pairs.find(x => x.id == client.id).peer;
    peer.onicecandidate = (event) => {
      if(event.candidate){
        client.emit('message', {candidate: event.candidate});
      }
    }
    try {
      //console.log('handling Candidate', data.candidate)
      //if(data.candidate){
        //console.log('handling candidate')
        //await this.peerService.addIceCandidate(peer, client, data.candidate);
      //}
      //await this.peerService.addIceCandidate(peer, client, data.candidate);
      await peer.addIceCandidate(data.candidate);
    } catch (e) {
      console.log('Unable to leave the room', e);
      //await this.peerService.addIceCandidate(peer, client, data.candidate); 
      await peer.addIceCandidate(data.candidate);
    }
  }

  @SubscribeMessage('offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
      
      let peer = this.pairs.find(x => x.id == client.id).peer;    
      await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log('options', this.peerService.options);
      let answer = await peer.createAnswer(this.peerService.options);
      await peer.setLocalDescription(await answer);
      client.emit('message', {answer: await answer});
      //client.emit('message', { offer: data.offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
     let peer = this.pairs.find(x => x.id == client.id).peer;
     peer.setRemoteDescription(data.answer);
//    client.emit('message', { answer: data.answer });
  }

  @SubscribeMessage('media')
  handleMedia(
    @ConnectedSocket() client: Socket,
    stream: any, 
    data: any
  ): void {
    this.sttService.speechToText(stream, (data) => {     
      if(data.confidence > 65){	
        client.emit('message', { log: data.transcript });
      }
    });
  }
}

interface Options {
  room: string;
  user: string;
}
