import Image from "next/image";
import { Ref, RefObject, useRef } from "react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { blob } from "stream/consumers";

const StreamMicrophone = ({ ws }: { ws: RefObject<WebSocket | null> }) => {

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
    } catch (error) {
      console.log(error);
    }
  }

  const startStreaming = async () => {
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
      <button onMouseUp={stopStreaming} onMouseDown={startStreaming} className="transition duration-200 ease-in-out w-[100px] h-[100px] relative active:scale-120">
        <Image src={"/mic.png"} fill alt="mic" />
      </button>
    </>
  )
}

export default StreamMicrophone