import { Mic } from "lucide-react";
import Image from "next/image";
import { Dispatch, Ref, RefObject, SetStateAction, useRef } from "react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { blob } from "stream/consumers";
import { Button } from "./ui/button";

const StreamMicrophone = ({ setActivity, ws }: { setActivity: Dispatch<SetStateAction<string>>, ws: RefObject<WebSocket | null> }) => {

  const recorder = useRef<RecordRTC | null>(null)

  const handleDataAvailable = (event: Blob) => {
    if (event.size > 0) {
      console.log('blob', event);
      //Blobs, representing raw binary data, are often unsuitable for direct transmission over WebSockets, which primarily handle text-based data. Converting a Blob to 
      // Base64 addresses this limitation by encoding the binary data into a text format, ensuring compatibility with WebSocket's text-based communication channel.
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        ws.current?.send(
          JSON.stringify({
            type: "stream_audio",
            audio_data: base64Data,
          })
        );
      }

      reader.readAsDataURL(event)

      /*
        Reader.readAsDataURL takes in a Blob or File and reads it and when reading 
        is complete loadend event is triggered and reader.result contains data
        in form of data:URL
        example of data:URL => 'data:audio/wav,<Base64 Encoded string>'
      */

    }
  }
  const stopStreaming = async () => {

    try {
      if (recorder.current && ws.current) {
        recorder.current.stopRecording(() => {
          ws.current?.send(JSON.stringify({
            type: "stop_audio"
          }))
        });
      }
      console.log("Stopping audio streaming to server");
      setActivity("none");
    } catch (error) {
      console.log(error);
    }
  }

  const startStreaming = async () => {
    console.log("Starting audio streaming to server");
    setActivity("human");
    try {

      ws.current?.send(JSON.stringify({
        type: "start_audio",
        id: "123"
      }))

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          recorder.current = new RecordRTC(stream, {
            type: 'audio',
            recorderType: StereoAudioRecorder,
            mimeType: 'audio/wav',
            timeSlice: 500, // time in ms to send the audio chunks
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            ondataavailable: handleDataAvailable
          })

          recorder.current?.startRecording();
        })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
     <Button onMouseUp={stopStreaming} onMouseDown={startStreaming} className="flex gap-2">
       <Mic size={32} />
       <span>Speak</span>
     </Button>
    </>
  )
}

export default StreamMicrophone