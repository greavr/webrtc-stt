import {
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({transports: ['websocket']})
export class StreamGateway implements OnGatewayInit, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('StreamGateway');

  handleDisconnect(client: Socket) {
    this.logger.log('Disconnect', client.id);
  }

  handleConnection(client: Socket){
    this.logger.log('Connect', client.id)
  }

  handleConnectionError(client){
    this.logger.log('Error', client.id);
  }

  afterInit(server: Server) {
     this.logger.log('Server Initiated');
  }


  // onModuleInit(): void {
  //   this.server.use(socketioJwt.authorize({
  //     secret: jwtConstants.secret,
  //     handshake: true
  //   }));
  // }
  // private activeSockets: { room: string; id: string }[] = [];


  @SubscribeMessage('message')
  handleMessage(client: Socket, @MessageBody() data: any) {
    client.broadcast.emit('message', 'FUCK');
    this.logger.log('Message Received', data);
    return 'message acknowledged';
  }

  @SubscribeMessage('chat')
  handleChat(client: Socket,@MessageBody() data: any) {
    client.broadcast.emit('message', 'FUCK');
    this.logger.log('Chat Received', data);
    return 'chat acknowledged';
  }

  @SubscribeMessage('event')
  handleEvent(client: Socket,@MessageBody() data: any) {
    client.broadcast.emit('message', 'FUCK');
    this.logger.log('event Received', data);
    return 'event acknowledged';
  }
}