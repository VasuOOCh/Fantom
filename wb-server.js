const WebSocket = require("ws");
const fs = require('fs')
const path = require('path');
const { exec } = require("child_process");
const { default: axios } = require("axios");
const wss = new WebSocket.Server({ port: 8080 });
const FormData = require('form-data');
const { Ollama } = require("ollama");
const { error } = require("console");

const runSoxCommand = (soxCommand) => {
    return new Promise((resolve, reject) => {
        exec(soxCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing sox: ${error}`);
                reject(error);
                return;
            }
            console.log(stdout);
            console.error(stderr);
            resolve();
        });
    });
}

const streamTTS = async (text, ws) => {
    try {
        const payload = `assistant: ${JSON.stringify(text)}`;
        const res = await fetch(`http://localhost:5002/api/tts?text=${encodeURIComponent(text)}`, {
            method: 'GET',
        });

        if (!res.ok) throw new Error('Failed to fetch TTS');

        // Collect all audio chunks first
        const chunks = [];
        const reader = res.body.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        // Combine all chunks into a single Uint8Array
        let totalLength = 0;
        chunks.forEach(chunk => {
            totalLength += chunk.length;
        });

        const combined = new Uint8Array(totalLength);
        let offset = 0;
        chunks.forEach(chunk => {
            combined.set(chunk, offset);
            offset += chunk.length;
        });

        // Convert the combined audio to base64
        const base64Audio = Buffer.from(combined).toString('base64');

        // Send the text payload first
        ws.send(payload);

        // Then send the combined audio
        ws.send(`tts_chunk: ${JSON.stringify(base64Audio)}`);

    } catch (error) {
        console.error('TTS Error:', error);
    }
};




wss.on('connection', (ws) => {
    const client = new Ollama();
    console.log("Recieved Client");

    ws.audioDataArray = [];
    ws.tempFiles = [];

    ws.on('message', async (message) => {

        const data = JSON.parse(message)
        // console.log(data);
        if (data.type == "start_audio") {
            console.log("Streaming of Client audio started");
        } else if (data.type == "stop_audio") {
            console.log("Stopping cliient streaming session");

            //Temp directory creation:
            const tempDir = path.join(__dirname, "temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Write the buffers in temp files
            ws.audioDataArray.forEach((buffer, index) => {
                const tempFilePath = path.join(tempDir, `chunk-${index}.wav`);
                fs.writeFileSync(tempFilePath, buffer);
                ws.tempFiles.push(tempFilePath);
            })

            // Concat the chunks
            const combinedFilePath = path.join(
                __dirname,
                "uploads",
                `combined.wav`
            );

            const soxCommand = `sox ${ws.tempFiles.join(" ")} ${combinedFilePath}`;

            await runSoxCommand(soxCommand);
            console.log(`Combined audio saved to ${combinedFilePath}`);

            // Clean up temporary files
            await Promise.all(
                ws.tempFiles.map(async filePath => {
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        console.warn(`Failed to delete ${filePath}:`, err.message);
                    }
                })
            );

            ws.audioDataArray = [];
            ws.tempFiles = [];

            /*
            fs.createReadStream is a method that creates a readable stream for a file. It reads the
            file in chunks and emits them sequentially, which allows for handling large files
            efficiently.

            fs.readFile is a method that reads the entire contents of a file into memory. It is synchronous or asynchronous, depending on the function used (fs.readFileSync for synchronous or fs.readFile for asynchronous).

             */

            const formData = new FormData();
            formData.append('audio', fs.createReadStream(combinedFilePath), {
                filename: 'recording.wav',
                contentType: 'audio/wav',
            });

            const Whisper_res = await axios.post('http://localhost:8000/transcribe', formData)
            // res.data.text contains the transciption
            // console.log(Whisper_res.data.text);
            ws.send(`user: ${JSON.stringify(Whisper_res.data.text)}`)

            const chatRes = await client.chat({
                model: 'mistral',
                messages: [
                    // ...history,
                    {
                        role: "user",
                        content: Whisper_res.data.text
                    }
                ],
                stream: true
            })

            // ChatRes is also a stream so we can use for..await..of loop

            let pendingText = '';
            for await (const chunk of chatRes) {
                // chunk is an object : {..., message : {content : "sample" } ,,,}
                const payload = `assistant: ${JSON.stringify(chunk)}\n\n`;
                pendingText += chunk.message.content;

                if (pendingText.length > 20 && (pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!'))) {
                    streamTTS(pendingText, ws);
                    pendingText = '';
                }
                // ws.send(payload)
            }
            ws.send('stream_llm_end')
            // fs.unlinkSync(combinedFilePath);


        } else if (data.type == "stream_audio") {
            if (typeof data.audio_data == "string") {
                // Generate the buffer from data.audio_data
                const audioData = Buffer.from(data.audio_data.split(",")[1], "base64");
                /* 
                Buffer is save in RAM and used only in NodeJS

                Blob is not used here it is HTML specific and is used to represent images/video 
                (Blob can also be created in NodejS but not famous though !)

                It is direct binary representation of data (eg .wav audio file)
                You can save it as fs.writeFileSync('audio.wav', audioData); 
                OR you can send it as Response
                */
                console.log(`Received audio data chunk of length: ${audioData.length}`);
                ws.audioDataArray.push(audioData);
            } else {
                console.error("Invalid audio data format");
            }
        }
    })
})