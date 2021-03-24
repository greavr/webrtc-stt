import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from './chat/chat.component';
import { HttpClientModule} from "@angular/common/http";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {ReactiveFormsModule} from "@angular/forms";
import { MeetingComponent } from './meeting/meeting.component';
import { WaveformComponent } from './waveform/waveform.component';
import {EventService} from "./services/event.service";
import {FulfillmentService} from "./services/fulfillment.service";
import {IoService} from "./services/io.service";

const config: SocketIoConfig = {
  url: 'http://localhost:8888/stream',
  options: {
    transports:['websocket'],
    binaryType:'arrayBuffer'},

};

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    MeetingComponent,
    WaveformComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    ReactiveFormsModule
  ],
  providers: [
    EventService,
    FulfillmentService,
    IoService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
