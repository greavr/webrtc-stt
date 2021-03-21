import { Injectable, NgModule } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class SocketOne extends Socket {

  constructor() {
    super({ url: 'http://localhost:8888', options: {transports:['websocket']}});
  }

}
