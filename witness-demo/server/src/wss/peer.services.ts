import { Injectable } from '@nestjs/common';
import { RTCPeerConnection, getUserMedia } from 'wrtc';
import { Socket } from 'socket.io';

@Injectable()
export class PeerService {
  constructor() {}
  private configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.1.google.com:19302' }],
  };
  options = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  };

  async newPeer(): Promise<RTCPeerConnection> {
    //console.log('WRTC', RTCPeerConnection);
    const peer = await new RTCPeerConnection(this.configuration);
    this.setupPeer(peer);
    getUserMedia({ audio: false, video: false }).then((stream) => {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    });
    return await peer;
  }

  private setupPeer(peer: RTCPeerConnection) {
    peer.onconnectionstatechange = (event) => {
      console.log('EVENT', event);
      console.log('state', peer.connectionState);
      if (peer.connectionState === 'connecting') {
        console.log('connecting', event);
      } else if (peer.connectionState === 'connected') {
        console.log('connected');
        //getUserMedia({audio:false, video: false})
        //  .then(stream => {
        //     stream.getTracks().forEach((track)=>{
        //        peer.addTrack(track,stream);
        //   })
        // });
      } else if (peer.connectionState === 'closed') {
        console.log('closed', peer);
      } else if (peer.connectionState === 'failed') {
        console.log('pc failed');
      } else if (peer.iceConnectionState === 'disconnected') {
        console.log('disconnected');
      }
    };
    peer.addEventListener('track', (event) => {
      console.log('track found');
      //if(!this.audio){
      //  this.audio = document.createElement('audio');
      //}
      //this.audio.srcObject = event.streams[0];
      //this.audio.play();
    });
    peer.onnegotiationneeded = async (e) => {
      console.log('NEGOTE', e);
      if (peer.connectionState == 'connecting') {
        console.log('negotionationneeded-connecting', e);
      } else if ((e.target as RTCPeerConnection).connectionState == 'new') {
        console.log('new client');
      } else if ((e.target as RTCPeerConnection).connectionState == 'failed') {
        console.log('negot-failed');
      } else if (
        (e.target as RTCPeerConnection).connectionState == 'connected'
      ) {
        console.log('renegotiateConnected client');
        const offer = await this.newOffer(peer);
        //       this.socket.send('offer', {offer: await offer});
      }
    };
  }

  async newOffer(peer: RTCPeerConnection) {
    console.log('new offer has been called');
    if (peer.signalingState.toString() === 'clsoed') {
      peer = await this.newPeer();
    }
    const offer = await peer.createOffer(this.options);
    await peer.setLocalDescription(offer);
    return offer;
  }
  async addIceCandidate(
    peer: RTCPeerConnection,
    client: Socket,
    candidate: any,
  ) {
    peer.onicecandidate = (event) => {
      //console.log('IN CUSTOM', event);
      if (event.candidate) {
        console.log('candidate', candidate);
        //console.log('emittingCandidate', event.candidate);
        client.emit('message', { candidate: event.candidate });
      }
    };
    try {
      await peer.addIceCandidate(candidate);
    } catch (e) {
      await peer.addIceCandidate(candidate);
    }
  }
}
