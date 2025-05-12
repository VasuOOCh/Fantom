const WebSocket = require('ws');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
const axios = require('axios');
const FormData = require('form-data');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Configuration
const CHUNK_DURATION_MS = 1000; // Process every 1 second of audio
const SAMPLE_RATE = 16000;

wss.on('connection', (ws) => {
    console.log("New Client connected!");
    
    let buffers = [];
    let lastProcessTime = Date.now();
    let byteCount = 0;
    const expectedBytesPerSecond = SAMPLE_RATE * 2; // 16-bit samples

    ws.on("message", async (msg) => {
        buffers.push(msg);
        byteCount += msg.length;
        
        // Process if we have enough audio for CHUNK_DURATION_MS
        if (byteCount >= expectedBytesPerSecond || Date.now() - lastProcessTime >= CHUNK_DURATION_MS) {
            const filename = `audio_${uuidv4()}.webm`;
            const buffer = Buffer.concat(buffers);
            
            fs.writeFileSync(filename, buffer);
            console.log(`Processing chunk: ${filename}, size: ${buffer.length} bytes`);
            
            const form = new FormData();
            form.append("audio", fs.createReadStream(filename));

            try {
                const start = Date.now();
                const res = await axios.post("http://localhost:5000/transcribe/", form, {
                    headers: form.getHeaders(),
                    timeout: 5000 // 5 second timeout
                });
                console.log(`Transcription (${Date.now() - start}ms):`, res.data.text);
                ws.send(JSON.stringify({ text: res.data.text }));
            } catch (err) {
                console.error("Transcription error:", err.message);
            } finally {
                // Clean up and reset
                try { fs.unlinkSync(filename); } catch (e) {}
                buffers = [];
                byteCount = 0;
                lastProcessTime = Date.now();
            }
        }
    });
});

server.listen(3001, () => console.log("WS server running on ws://localhost:3001"));