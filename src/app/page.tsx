'use client'
import { useState } from "react";

export default function Home() {
  const [started, setStarted] = useState<boolean>(false);
  
  const handleStartStop = () => {
    setStarted(!started);
  }

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
          <div className="w-[300px] h-[300px] bg-red-300">
            User
          </div>
        </div>

        {/* Conversation */}
        <div className="ring-1 flex-1">
          This is a sample Conversation.
        </div>
      </div>

      {/* Controller */}
      <div>
          <button onClick={handleStartStop} className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm p-4 px-8">Start</button>
      </div>
    </div>
  );
}
