import {Socket} from "ngx-socket-io";
import {Injectable} from "@angular/core";
const ss = require('socket.io-stream');

@Injectable({
  providedIn: 'root'
})
export class IoService {

  constructor(private socket: Socket) {
  }

  sendBinaryStream(blob: any) {
    console.log('blob', blob);
    let stream = ss.createStream();
    ss(this.socket).emit('stream', stream, {name: 'stream.mp3', size: blob.size})
    ss.createBlobReadStream(blob).pipe(stream);
  }

  handleError(e){
    console.log('ERROR', e);
  }

  sendMessage(eventName: string, obj: any) {
    this.socket.emit(eventName, obj);
  }

  receiveStream(eventName: string, callback: any) {
    this.socket.on(eventName, function(data) {
      callback(data);
    });
  }
}
