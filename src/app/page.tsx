'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bot, CircleUser, Terminal, Settings, PhoneOff, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

/* 
URL() constructor is a client feature. Therefore, somehow NextJS was still trying to render this code on the server.
This is the reason I we are dynamically importing the component with ssr = false
*/

const dummyTopics = [
  'javascript', 'git', 'java', 'coding'
]

const dummyLevel = "high"

const StreamMicrophone = dynamic(() => import('../components/streammicrophone'), {
  ssr: false
})


type message = {
  role: 'user' | 'assistant',
  content: string
}

export default function Home() {
  const [started, setStarted] = useState<boolean>(true)
  const ws = useRef<WebSocket | null>(null);
  const [convo, setConvo] = useState<message[]>([]);
  const audioQueue = useRef<AudioBuffer[]>([]);
  const messageQueue = useRef<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  })

  useEffect(() => {
    if (seconds >= 60) {
      setSeconds((prev) => prev % 60); // reset seconds
      setMinutes((prev) => prev + 1);
    }
  }, [seconds]);

  useEffect(() => {
    if (minutes >= 60) {
      setMinutes((prev) => prev % 60); // reset minutes
      setHours((prev) => prev + 1);
    }
  }, [minutes]);

  const [activity, setActivity] = useState<string>("none")

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
      setActivity("none")
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueue.current.shift()!;
    const textChunk = messageQueue.current.shift() || ""; // Get corresponding text chunk
    console.log("Text chunk is : ", textChunk, " -- Length is ", textChunk.length);

    // Update the UI right before playing the audio
    if (textChunk) {
      setConvo((prev) => {
        // If last message was from user or there are no messages, add new assistant message
        if (prev.length === 0 || prev[prev.length - 1].role === "user") {
          return [...prev, {
            role: "assistant",
            content: textChunk
          }];
        } else {
          // The below code prevents duplication
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage.content.includes(textChunk)) {
            /*
              ----------- What's happening below ---------
              Source : GPT 4-o written in own language by VasuOOCh

              if we do this :-
              updated = [...prev]
              updated[updated.length - 1] += textChunk
              return updated

              This peace of code doesnt allow react to re render the componenet !
              Why ????

              Before re rendering react checks : 
              1) The returned reference was changed or not
              --> Since we are creating a new array updated, so this check is passed
              2) Checks element wise reference
              --> We have changed the value of the last object in that array, but the refernce to last object is not changed
              --> So react thinks that all the element have the same previous ref of 'prev'

              ##### This above comparision is called react-Shallow comparision

              In Our new code we are : (Below code)
              1) Changing the whole returned reference (Which was also the above case)
              2) Change the ref of last element by creating a new object rathan than just updating the existing ones
              
             */
            return prev.map((msg, index) => {
              if (index === prev.length - 1 && msg.role === "assistant") {
                // Only modify the last assistant message
                return { ...msg, content: msg.content + textChunk };
              }
              return msg;
            });
          }
          return prev; // No change if duplicate detected
        }
      });
    }

    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 2;
    source.connect(audioContextRef.current!.destination);
    source.onended = playNextInQueue;
    source.start();
    setActivity("ai");

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
            if (data) {
              messageQueue.current.push(data);
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
          console.log("done receiving text input");
        } else if (line.startsWith('tts_chunk: ')) {

          const audioChunk = JSON.parse(line.substring(11));
          // console.log("audio chunk received");
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

    // Timer function
    // const interval = setInterval(() => {
    //   setSeconds(prev => prev + 1)
    // }, 1000);

    return () => {
      ws.current?.close();
      // window.clearInterval(interval)
    };
  }, [started]);

  return (
    <div className="flex flex-col items-center h-full">
      {/* Main interface */}
      <div className="flex gap-4 m-8 w-full p-8 items-center">

        <div className="flex flex-col gap-4 items-center h-full justify-around">
          {/* For AI */}
          <div className="w-[300px] h-[300px] relative">
            <Image src={"/person1.jpg"} className="rounded-3xl" fill alt="AI image" />
            <span className="px-2 py-1 absolute bottom-2 left-2 bg-[rgba(0,0,0,0.5)] rounded-2xl">AI interviewer</span>
          </div>

          {/* For user */}
          <div className="w-[300px] h-[300px] bg-red-300 rounded-3xl flex items-center justify-center relative">
            {/* <Image src={"/person1.jpg"} className="rounded-3xl" fill alt="AI image" /> */}
            <span className="px-2 py-1 absolute bottom-2 left-2 bg-[rgba(0,0,0,0.5)] rounded-2xl">Candidate</span>
          </div>

          <div className="flex gap-4">
            <Button variant={"secondary"}>
              <Settings />
            </Button>
            <Button className="flex items-center gap-2" variant={"destructive"}>
              <PhoneOff />
              <span>End Interview</span>
            </Button>
          </div>
        </div>

        {/* Conversation */}
        <Card className="flex-1 h-[800px] flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg ">Transcript & Chat</CardTitle>

            <div className="flex gap-2 items-center">
              <Timer />
              <span>Time elapsed &nbsp; &nbsp;  {hours} : {minutes} : {seconds}</span>
            </div>
          </CardHeader>
          <Separator />
          <CardContent ref={scrollRef} className="flex flex-col flex-1 overflow-y-scroll">
            {convo.map((convo, index) => (
              <div
                key={index}
                className={`flex ${convo.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-4 flex gap-4 items-center max-w-[80%]`}>
                  {convo.role === "user" ? (
                    <>
                      <p className="bg-red-100 text-black px-4 py-2 rounded-lg">
                        {convo.content}
                      </p>
                      <CircleUser className="shrink-0" />
                    </>
                  ) : (
                    <>
                      <Bot className="shrink-0" />
                      <p className="bg-blue-100 text-black px-4 py-2 rounded-lg">
                        {convo.content}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          <Separator />

          <CardFooter className="flex">
            <div className="flex gap-2 flex-1">
              <Terminal />
              <span>{
                activity == "human" ? "Human is speaking..." : activity == "ai" ? "AI is speaking..." : "No activity detected"
              }</span>
            </div>
            <div>
              <StreamMicrophone setActivity={setActivity} ws={ws} />
            </div>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}
