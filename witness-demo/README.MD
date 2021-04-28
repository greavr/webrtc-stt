#WebRTC - STT
## Witness Demo

In this repo we have an Angular and NestJS stack set up to use Websockets with WebRTC.

The NestJS Websocket server acts as both the Signaling Server and the Media Server

Rather than a Mesh architecture, in this repo we have a MCU

### Technologies Used
- Angular
- NestJS
- WebRTC
- Google STT

### Flow
- User selects an existing room, or inputs a new one.
- User joins room
- WebRTC activates user's media devices
- MediaStream is sent to Media Server
- Multiple streams are combined into one and send back to clients
- Server mixes and sends to Google STT
- Transcription of AudioStream is received
  
#### Witness Portion
On the creation of a Room, spin up a Witness 


