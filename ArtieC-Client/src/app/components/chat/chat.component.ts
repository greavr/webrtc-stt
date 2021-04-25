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
  persons: string[] = ['jacob', 'heather', 'louis', 'rick'];
  configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.1.google.com:19302' }]
  };
  private peerConnection: RTCPeerConnection;
  private offer;
  audio;
  recordAudio: any;
  remoteStream = new MediaStream();
  localStream;

  constructor(private socket: SocketService) {
  }

  async ngOnInit(): Promise<void> {
    this.toggle = false;
    this.peerConnection = new RTCPeerConnection(this.configuration);
    await this.setupPeer();

    this.socket.listen('message').subscribe(async (data) => {
      if (data.answer) {
        try {
          const remoteDesc = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(remoteDesc);
	} catch (e) {
	  console.log('answerError', e);
	}
      } else if (data.offer){
        try{
	  await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await  this.peerConnection.createAnswer();
          await  this.peerConnection.setLocalDescription(answer);
          this.socket.send('answer', {answer});
        } catch (e) {
          console.log('offerError', e);
        }
      } else if (data.candidate) {
        try{
          await this.peerConnection.addIceCandidate(data.candidate);
        } catch (e) {
          await this.peerConnection.addIceCandidate(data.candidate);
        }
      } else if (data.log){
        console.log('LOG', data.log);
      }
    });
  }

  // tslint:disable-next-line:typedef
  async setupPeer() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.send('candidate', {candidate: event.candidate});
      }
    };
    this.peerConnection.addEventListener('connectionstatechange', event => {
      if ((event.target as RTCPeerConnection).connectionState === 'connecting'){
        console.log('connecting', event.target);
      } else if (this.peerConnection.connectionState === 'connected') {
        console.log('connected', event.target);
        if(!this.localStream){
	  this.setupMedia();
	}
      } else if (this.peerConnection.connectionState === 'closed') {
        console.log('closed', this.peerConnection);
      } else if ((event.target as RTCPeerConnection).connectionState === 'failed'){
        console.log('failed');
      } else if (this.peerConnection.iceConnectionState === 'disconnected'){
        console.log('disconnected');
      }
    });
   this.peerConnection.addEventListener('track', event => {
     if(!this.audio){
       this.audio = document.createElement('audio');
     }
     this.audio.srcObject = event.streams[0];
     this.audio.play();
   });
   this.peerConnection.onnegotiationneeded = async (e) => {
     if(this.peerConnection.connectionState == 'connecting'){
       console.log('connecting');
     } else if((e.target as RTCPeerConnection).connectionState == 'new') {      
       console.log('new client')
     } else if((e.target as RTCPeerConnection).connectionState == 'failed') {
       console.log('failed');
     } else if ((e.target as RTCPeerConnection).connectionState == 'connected') {
       console.log('renegotiateConnected client');
       await this.newOffer();
       this.socket.send('offer', {offer: this.offer});
     } 
   }
  }

  async newOffer(){
   if(this.peerConnection.signalingState === 'closed'){
     this.peerConnection = new RTCPeerConnection(this.configuration);
   }
   this.offer = await this.peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: false});
   await this.peerConnection.setLocalDescription(this.offer);
  }

  async connectToRoom(): Promise<void> {
    await this.newOffer();
    this.socket.connect(this.chatForm.value);
    this.socket.send('offer', {offer: this.offer});
    this.toggle = !this.toggle;
  }

  async disconnect(): Promise<void>{
    if(this.recordAudio){
      this.recordAudio.stopRecording();
    }
    if(this.audio){
      this.audio.srcObject = null;
    }
    this.recordAudio.stopRecording()
    this.localStream.getTracks().forEach((track) => track.stop());
    this.setupPeer();   
    this.peerConnection.close();
    this.socket.disconnect();
    this.toggle = !this.toggle;
  }

  async setupMedia(): Promise<void> {
    const me = this;
    let media = navigator.mediaDevices.getUserMedia({
      audio: true
   }).then((stream: MediaStream) => {
      me.peerConnection.addTrack(stream.getAudioTracks()[0], stream);
      me.localStream = stream;
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
             me.socket.sendStream(blob);
          }
        }
      });
      me.recordAudio.startRecording();
    }).catch((error) => {
      console.error(JSON.stringify(error));
    });
  }
}
