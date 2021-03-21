
// import {Socket} from "ngx-socket-io";
import {io} from 'socket.io-client'
import {Injectable} from "@angular/core";
import {SocketOne} from "./socket.service";
@Injectable({
  providedIn: 'root'
})
export class IoService {
  public lang: string;

  constructor(private socket: SocketOne) {
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
    // const me = this;
    // const stream = ss.createStream();
    // stream directly to server
    // it will be temp. stored locally
    // ss(me.socket).emit('stream-speech', stream, {
    //   name: '_temp/stream.wav',
    //   size: blob.size,
    //   language: me.lang
    // });
    // pipe the audio blob to the read stream
    // ss.createBlobReadStream(blob).pipe(stream);

    console.log('in send', this.socket);
    // this.socket.on('connection', ()=>{
    //   console.log('inside connection');
    // })
    //   this.socket.emit('event', {data: 'fuckEvent'}, data => console.log(data));
    // this.socket.emit('chat', {data: 'fuckChat'}, data => console.log(data));
    // this.socket.emit('message', {data: 'fuckMessage'}, data => console.log(data));
  }

  sendMessage(eventName: string, obj: any) {
    obj.audio.language = this.lang;
    this.socket.emit(eventName, obj);
  }

  receiveStream(eventName: string, callback: any) {
    this.socket.on(eventName, function(data) {
      callback(data);
    });
  }
}
