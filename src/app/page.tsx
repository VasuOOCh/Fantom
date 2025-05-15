'use client'
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc"

/* 
URL() constructor is a client feature. Therefore, somehow NextJS was still trying to render this code on the server.
This is the reason I we are dynamically importing the component with ssr = false
*/
const StreamMicrophone = dynamic(() => import('../components/streammicrophone'), {
  ssr: false
})


type message = {
  role: 'user' | 'assistant',
  content: string
}

export default function Home() {
  const [started, setStarted] = useState<boolean>(false)
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  let stream = useRef<null | MediaStream>(null);
  const [convo, setConvo] = useState<message[]>([]);
  const streamingMessage = useRef(""); // Holds current assistant message
  const audioQueue = useRef<AudioBuffer[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);


  function base64ToAudioBuffer(base64: string): AudioBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;

    // Fill Uint8Array from binary string
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // ⚠️ Ensure the byte length is even before creating Int16Array
    const trimmedBuffer = bytes.buffer.slice(0, bytes.byteLength - (bytes.byteLength % 2));

    const int16Array = new Int16Array(trimmedBuffer);

    // Convert to Float32 PCM [-1, 1]
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    // Create audio buffer
    const sampleRate = 16000;
    const audioBuffer = audioContextRef.current!.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    return audioBuffer;
  }
  

  const playNextInQueue = () => {
    if (audioQueue.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueue.current.shift()!;
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 2
    source.connect(audioContextRef.current!.destination);
    source.onended = playNextInQueue;
    source.start();
  };



  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setup = async () => {
      ws.current = new WebSocket("ws://localhost:8080");

      ws.current.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.current.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.current.onmessage = (ev) => {

        const line = ev.data;

        if (line.startsWith('assistant: ')) {
          try {
            const data = JSON.parse(line.substring(11));
            if (data.message && data.message.content) {
              streamingMessage.current += data.message.content;
              setConvo((prev) => {
                let updated = [...prev];
                if (updated[updated.length - 1].role == "user") {
                  return [...prev, {
                    role: "assistant",
                    content: streamingMessage.current
                  }]
                } else {
                  updated[updated.length - 1].content = streamingMessage.current;
                  return updated;
                }
              })


            }
          } catch (error) {
            console.error("Error parsing stream data:", error, line);
          }
        }
        else if (line.startsWith('user: ')) {
          const userData = JSON.parse(line.substring(6));
          console.log(userData);

          setConvo((prev) => (
            [...prev, {
              role: "user",
              content: userData
            }]
          ))

        } else if (line == "stream_llm_end") {
          console.log("done receiving input");
          streamingMessage.current = "";
        } else if (line.startsWith('tts_chunk: ')) {
          console.log("received audio");

          const audioChunk = JSON.parse(line.substring(11));
          console.log("audio chunk received");
          const audioBuffer = base64ToAudioBuffer(audioChunk);
          audioQueue.current.push(audioBuffer);
          if (!isPlayingRef.current) {
            playNextInQueue();
          }
        }

      }

    };

    if (started) {
    setup().catch((err) => console.error("Setup failed:", err));
    }
    audioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
    audioContextRef.current.resume();
    return () => {
      ws.current?.close();
    };
  }, [started]);

  return (
    <div className="flex flex-col items-center h-full">
      {/* Main interface */}
      <div className="flex gap-4 m-8 w-full p-8 items-center">

        <div className="flex flex-col gap-4">
          {/* For AI */}
          <div className="w-[300px] h-[300px] bg-blue-300">
            AI
          </div>

          {/* For user */}
          <div className="w-[300px] h-[300px] bg-red-300 flex items-center justify-center">
            {/* <button onMouseUp={stopStreaming} onMouseDown={startStreaming} className="transition duration-200 ease-in-out w-[100px] h-[100px] relative active:scale-120">
              <Image src={"/mic.png"} fill alt="mic" />
            </button> */}
            <StreamMicrophone ws={ws} />

          </div>
        </div>

        {/* Conversation */}
        <div className="ring-1 flex-1 overflow-y-scroll h-[700px]">
          {
            convo.map((convo, index) => (
              <div key={index} className="p-4 border-b border-gray-300">
                {/* User Message */}
                {
                  convo.role == "user" ? (
                    <div className="text-right">
                      <p className="inline-block bg-red-100 text-black px-4 py-2 rounded-lg max-w-[70%]">
                        {convo.content}
                      </p>
                    </div>
                  ) : (
                    <div className="text-left mt-2">
                      <p className="inline-block bg-blue-100 text-black px-4 py-2 rounded-lg max-w-[70%]">
                        {convo.content}
                      </p>
                    </div>
                  )
                }


              </div>
            ))
          }

        </div>
      </div>

    </div>
  );
}
