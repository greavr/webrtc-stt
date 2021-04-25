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
	  console.log('answer', e);
	}
      } else if (data.offer){
        try{
          console.log('in offer');
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
	  console.log('technically an error');
          await this.peerConnection.addIceCandidate(data.candidate);
        }
      } else if (data.log){
        console.log( 'LOG', data.log);
      }
    });

  }

  // tslint:disable-next-line:typedef
  async setupPeer() {
    //this.peerConnection = new RTCPeerConnection(this.configuration);
    //this.offer = await this.peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: false});
    //await this.peerConnection.setLocalDescription(this.offer);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        //console.log('candidate', event.candidate);
        this.socket.send('candidate', {candidate: event.candidate});
      }
    };
    this.peerConnection.addEventListener('connectionstatechange', event => {
      //console.log('stateChange', (event.target as RTCPeerConnection).connectionState);
      if ((event.target as RTCPeerConnection).connectionState === 'connecting'){
        console.log('connecting', event.target);
      } else if (this.peerConnection.connectionState === 'connected') {
        console.log('connected', event.target);
      } else if (this.peerConnection.connectionState === 'closed') {
        console.log('closed', this.peerConnection);
      } else if ((event.target as RTCPeerConnection).connectionState === 'failed'){
        console.log('failed');
      } 
    });
   this.peerConnection.addEventListener('track', event => {
     console.log('foundTrack', event);
     let audio = document.createElement('audio');
     audio.srcObject = event.streams[0];
     audio.play();
   });
   this.peerConnection.onnegotiationneeded = async (e) => {
     console.log('negotiation needed', e.target);
     if(this.peerConnection.connectionState == 'connecting'){
       console.log('tryign to connect', e);
     } else if((e.target as RTCPeerConnection).connectionState == 'new') {      
       console.log('new client', e.target)
     } else if((e.target as RTCPeerConnection).connectionState == 'failed') {
       console.log(' failed');
     } else if ((e.target as RTCPeerConnection).connectionState == 'connected') {
       console.log('renegotiateConnected client');
       await this.newOffer();
       this.socket.send('offer', {offer: this.offer});
     } 
   }
  }

  async newOffer(){
   this.offer = await this.peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: false});
   await this.peerConnection.setLocalDescription(this.offer);
  }

  async connectToRoom(): Promise<void> {
    await this.newOffer();
    this.socket.connect(this.chatForm.value);
    this.socket.send('offer', {offer: this.offer});
    await this.setupMedia();
    //console.log('pc', this.peerConnection);
    this.toggle = !this.toggle;
  }

  disconnect(): void{
    this.recordAudio.stopRecording()
    this.localStream.getTracks().forEach((track) => track.stop());
    //this.peerConnection.close()    
    this.setupPeer();   
    this.socket.disconnect();
    this.toggle = !this.toggle;
  }

  async  setupMedia() {
    const me = this;
    navigator.mediaDevices.getUserMedia({
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
