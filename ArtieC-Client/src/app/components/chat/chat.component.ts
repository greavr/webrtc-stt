import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {SocketService} from '../../services/socket.service';
const { RTCPeerConnection, RTCSessionDescription } = window;

// @ts-ignore
const ss = require('socket.io-stream');
import RecordRTC from 'recordrtc';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  toggle: boolean;
  chatForm = new FormGroup({
    room: new FormControl(),
    user: new FormControl()
  });
  configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.1.google.com:19302' }]
  };
  private peerConnection: RTCPeerConnection;
  private offer;
  recordAudio: any;

  private uuid;

  constructor(private socket: SocketService) {
  }

  async ngOnInit(): Promise<void> {
    this.toggle = false;
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.offer = await this.peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: false});

    await this.peerConnection.setLocalDescription(this.offer);
    this.setupMedia();
    this.setupPeer();
    this.socket.listen('message').subscribe(async (data) => {
      if (data.answer) {
        const remoteDesc = new RTCSessionDescription(data.answer);
        await this.peerConnection.setRemoteDescription(remoteDesc);
      } else if (data.offer){
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await  this.peerConnection.createAnswer();
        await  this.peerConnection.setLocalDescription(answer);
        this.socket.send('answer', {answer});
      } else if (data.candidate) {
        try{
          await this.peerConnection.addIceCandidate(data.candidate);
        } catch (e) {
          await this.peerConnection.addIceCandidate(data.candidate);
        }
      } else if (data.log){
        console.log( 'LOG', data.log);
      }
    });

  }

  // tslint:disable-next-line:typedef
  setupPeer() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.send('candidate', {candidate: event.candidate});
      }
    };
    this.peerConnection.addEventListener('connectionstatechange', event => {
      if (this.peerConnection.connectionState === 'connected') {
        console.log('connected', this.peerConnection);
      }
    });
  }

  async connectToRoom(): Promise<void> {
    this.socket.connect(this.chatForm.value);
    this.socket.send('offer', {offer: this.offer});
    this.toggle = !this.toggle;
  }

  disconnect(): void{
    this.socket.disconnect();
    this.toggle = !this.toggle;
  }

  createUuid(): string{
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }

  s4(): any {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  setupMedia(): void {
    const me = this;
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((stream: MediaStream) => {
      // StereoAudioRecorder.isTypeSupported('audio/mpeg');
      me.peerConnection.addTrack(stream.getAudioTracks()[0]);
      me.recordAudio = RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        sampleRate: 44100, // this sampleRate should be the same in your server code

        // MediaStreamRecorder, StereoAudioRecorder, WebAssemblyRecorder
        // CanvasRecorder, GifRecorder, WhammyRecorder
        recorderType: RecordRTC.StereoAudioRecorder,

        // Dialogflow / STT requires mono audio
        numberOfAudioChannels: 1,

        // get intervals based blobs
        // value in milliseconds
        // as you might not want to make detect calls every seconds
        timeSlice: 5000,

        // only for audio track
        // audioBitsPerSecond: 128000,

        // used by StereoAudioRecorder
        // the range 22050 to 96000.
        // let us force 16khz recording:
        desiredSampRate: 16000,

        // as soon as the stream is available
        ondataavailable(blob: any): void {
          if (me.peerConnection.connectionState === 'connected'){
            const ssStream = ss.createStream();
            ss(this.socket).emit('media', ssStream, {name: 'stream.mp3', size: blob.size});
            ss.createBlobReadStream(blob).pipe(ssStream);
            // me.socket.send('media', blob);
          }
        }
      });
      me.recordAudio.startRecording();
      // recording started
      // me.waveform.start(stream);
    }).catch((error) => {
      console.log('fuck', error);
      console.error(JSON.stringify(error));
    });
  }
}
