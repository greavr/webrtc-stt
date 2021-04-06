import {Socket} from 'ngx-socket-io';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {

  }

  connect(data, fn?): void {
    this.socket.emit('join', data, (response) => {
     if (fn){fn(response); }
    });
  }

  disconnect(): void{
    this.socket.emit('leave', (response) => {
      console.log('response', response);
    });
  }

  listen(event: string): Observable<any> {
    return this.socket.fromEvent(event).pipe(map(data => data));
  }

  send(event: string, data: any, fn?): void {
    this.socket.emit(event, data, (response) => {
      if (fn){
        fn(response);
      }
    });
  }

  getId(): string {
    return this.socket.ioSocket.id;
  }
}
