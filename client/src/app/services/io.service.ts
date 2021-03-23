
import {Socket} from "ngx-socket-io";
import {Injectable} from "@angular/core";
const ss = require('socket.io-stream');

// declare const ss:any;

@Injectable({
  providedIn: 'root'
})
export class IoService {
  public lang: string;

  constructor(private socket: Socket) {
    // // @ts-ignore
    // this.socketio = new io('http://localhost:8888');
    // this.socket = this.socketio.on('connect', function() {
    //   console.log('connected');
    // });
    // this.socket.connect();
    // this.socket = this.socketio.on('connection', function() {
    //   console.log('connected');
    // });
    // this.socket. = 'arraybuffer';
    this.lang = 'en-US';
  }

  setDefaultLanguage(lang: string) {
    this.lang = lang;
  }

  sendBinaryStream(blob: any) {
// stream directly to server
    // it will be temp. stored locally
    // this.socket.emit('event', 'test')
    console.log(blob);
    // this.socket.emit('stream', )
    // this.socket.emit('stream',
    //   { blob
    //   })
    let stream = ss.createStream();
    console.log('blobstream', ss.createBlobReadStream(blob));
    this.socket.emit('stream', stream, {name:'stream.mp3', size:blob.size});
    ss.createBlobReadStream(blob).pipe(stream);
    // console.log('fuckin stream', stream);
    // ss(this.socket).emit('stream', stream, {
    //   name: 'stream.wav',
    //   size: blob.size
    // });
    // pipe the audio blob to the read stream
    // ss.createBlobReadStream(blob).pipe(stream);
  }

  sendMessage(eventName: string, obj: any) {
    // obj.audio.language = this.lang;
    this.socket.emit(eventName, obj);
  }

  receiveStream(eventName: string, callback: any) {
    this.socket.on(eventName, function(data) {
      callback(data);
    });
  }
}
