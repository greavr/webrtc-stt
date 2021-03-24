import { Injectable, NgModule } from '@angular/core';
import { Socket } from 'ngx-socket-io';
const ss = require('socket.io-stream');

@Injectable()
export class SocketOne extends Socket {

  constructor() {
    ss(super({ url: 'http://localhost:8888', options: {transports:['websocket']}}));
  }

}
