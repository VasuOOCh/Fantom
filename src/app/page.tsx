'use client'
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // const [started, setStarted] = useState<boolean>(false);
  // const ws = useRef<WebSocket | null>(null);
  // const recorder = useRef<MediaRecorder | null>(null);

  // useEffect(() => {
  //   const setup = async () => {
  //     ws.current = new WebSocket("ws://localhost:3001");

  //     ws.current.onopen = () => {
  //       console.log("WebSocket connected");
  //     };

  //     ws.current.onmessage = (event: MessageEvent) => {
  //       const blob = new Blob([event.data], { type: "audio/wav" });
  //       const audio = new Audio(URL.createObjectURL(blob));
  //       audio.play();
  //     };

  //     ws.current.onerror = (err) => {
  //       console.error("WebSocket error:", err);
  //     };

  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  //     mediaRecorder.ondataavailable = (e: BlobEvent) => {
  //       if (ws.current?.readyState === WebSocket.OPEN) {
  //         console.log("Chunk size:", e.data.size);
  //         ws.current.send(e.data);
  //       }
  //     };

  //     mediaRecorder.start(500);
  //     recorder.current = mediaRecorder;
  //   };

  //   if (started) {
  //     setup().catch((err) => console.error("Setup failed:", err));
  //   }

  //   return () => {
  //     recorder.current?.stop();
  //     ws.current?.close();
  //   };
  // }, [started]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  let stream = useRef<null | MediaStream>(null)

  const startRecording = async () => {
    // first get the stream of audio data using navigator
    stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    // use MediaRecorder to save the strean data in an array of Blob
    mediaRecorder.current = new MediaRecorder(stream.current);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    // start saving the audio in audioChunks
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = async () => {

    // to stop the stream
    stream.current?.getTracks().forEach((track) => {
      track.stop();
    })

    //  to stop the media recording
    mediaRecorder.current?.stop();
    mediaRecorder.current!.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(`Transcription: ${data.text}`);
    };
    setRecording(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Main interface */}
      <div className="flex gap-4 m-8 w-full p-8">

        <div className="flex flex-col gap-4">
          {/* For AI */}
          <div className="w-[300px] h-[300px] bg-blue-300">
            AI
          </div>

          {/* For user */}
          <div className="w-[300px] h-[300px] bg-red-300 flex items-center justify-center">
            <button onMouseUp={stopRecording} onMouseDown={startRecording} className="transition duration-200 ease-in-out w-[100px] h-[100px] relative active:scale-120">
              <Image src={"/mic.png"} fill alt="mic" />
            </button>
          </div>
        </div>

        {/* Conversation */}
        <div className="ring-1 flex-1">
          This is a sample Conversation.
        </div>
      </div>

    </div>
  );
}
