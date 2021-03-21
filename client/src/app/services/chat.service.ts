import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) {

  }

  sendChat(message: string){
    this.socket.emit('message', message);
    this.socket.emit('chat', message);
    this.socket.emit('event', message);
  }

  receiveChat(){
    return this.socket.fromEvent('chat');
  }

  getUsers(){
    return this.socket.fromEvent('users');
  }

}
