from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import subprocess
import os

app = FastAPI()

# Enable CORS for the frontend URL (e.g., localhost:3000)
origins = [
    "http://localhost:3000",  # React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from localhost:3000
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load Whisper model (use 'base', 'small', 'medium', etc. based on your need)
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    input_path = "temp.webm"
    output_path = "temp.wav"

    # Save the uploaded audio file
    with open(input_path, "wb") as f:
        f.write(await audio.read())

    # Convert .webm file to .wav (16kHz, mono) using FFmpeg
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path
        ], check=True)
    except subprocess.CalledProcessError as e:
        return {"error": "FFmpeg conversion failed", "details": str(e)}

    # Transcribe audio using Whisper
    try:
        result = model.transcribe(output_path)
        text = result.get("text", "").strip()
    except Exception as e:
        return {"error": "Whisper transcription failed", "details": str(e)}

    # Cleanup the temporary files
    os.remove(input_path)
    os.remove(output_path)

    return {"text": text}
