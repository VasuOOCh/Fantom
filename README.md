Install Mistral, Whisper by OpenAI, Conqui TTS, locally on your PC

1) Run ollama Mistral
--> ollama run mistral

2) Run the python server file of Whisper (Install the needed dependencies) | Run it in your local virtual python env
--> uvicorn whisper-server:app --host 0.0.0.0 --port 8000

3) Run Conqui TTS : 
--> tts-server --model_name tts_models/en/ljspeech/fast_pitch --port 5002
(You need to install tts_models/en/ljspeech/fast_pitch this model as well)

4) Run the Web Socket server: 
--> npm run dev-ws

5) Run the nextJS server
--> npm run dev

