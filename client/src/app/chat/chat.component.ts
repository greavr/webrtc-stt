import { Component,  Input } from '@angular/core';
import RecordRTC from 'recordrtc';
import { IoService } from '../services/io.service';
import { WaveformComponent } from '../waveform/waveform.component';
import { EventService } from '../services/event.service';
import { FulfillmentService } from '../services/fulfillment.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent{
  @Input() waveform: WaveformComponent;
  public utterance: any;
  public recordAudio: any;
  public startDisabled: boolean;
  public stopDisabled: boolean;

  constructor(
    public fulfillmentService: FulfillmentService,
    public ioService: IoService,
    public eventService: EventService,
  ) {
    let me = this;
    me.startDisabled = false;

    me.eventService.audioPlaying.subscribe(() => {
      me.onStop();
    });
    me.eventService.resetInterface.subscribe(() => {
      me.onStop(); // stop recording & waveform
      me.eventService.audioStopping.emit(); // stop playing audio
      me.reset(); // reset the interface
    });
  }

  onStart() {
    let me = this;
    me.startDisabled = true;
    // make use of HTML 5/WebRTC, JavaScript getUserMedia()
    // to capture the browser microphone stream
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(function(stream: MediaStream) {
      // StereoAudioRecorder.isTypeSupported('audio/mpeg');
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
        ondataavailable(blob: any) {
          if (!me.eventService.getIsPlaying()) {
            me.ioService.sendBinaryStream(blob);
            me.waveform.visualize();
          }
        }
      });
      me.recordAudio.startRecording();
      // recording started
      me.waveform.start(stream);
    }).catch(function(error) {
      console.log('fuck', error);
      console.error(JSON.stringify(error));
    });
  }

  onStop() {
    // recording stopped
    console.log('it stopped');
    this.startDisabled = false;
    // stop audio recorder
    this.recordAudio.stopRecording();
    this.waveform.stop();
  }

  reset() {
    this.fulfillmentService.clearAll();
  }
}
