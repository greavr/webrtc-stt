#WebRTC - STT

In this repo we look at different ways of using WebRTC to audio chat with other people and use the Google Speech-To-Text API to transcribe audio

##Witness

In the Witness setup, when a new room would be created, a Witness would be spun up as a separate client  to receive the stream and then send it to the STT API

This method reduces the strain on the server.

##Server Process

In the Server Process setup, the Signaling Server also acts as a media server and combines the audio into a single stream and both returns it to the users and sends it to the Google STT endpoint

###Recommendation
Depending on the size of the rooms and quality of the audio, having a single server do both the signaling and the media mixing is the simplest. 

As load and features grow, it also is the easiest to scale. Once a certain load/use is reached. The two processes (signaling and media) can be separated out into separate instances.
