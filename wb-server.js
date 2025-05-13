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
    console.log("streaming tts audio");
    
    try {
        const res = await fetch(`http://localhost:5002/api/tts?text=${encodeURIComponent(text)}`, {
            method: 'GET',
        })

        if(!res.ok) throw new Error(error);
        // ws.send(JSON.stringify({
        //     type : 'tts_start'
        // }))
        const reader = res.body.getReader();
        while(true) {
            const {value, done} = await reader.read();
            if(done) break;
            const base64Val = Buffer.from(value).toString('base64');
            ws.send(`tts_chunk: ${JSON.stringify(base64Val)}`)
        }
        // ws.send(JSON.parse({
        //     type : 'tts_end'
        // }))
    } catch (error) {
        console.log(error);
    }
}




wss.on('connection', (ws) => {
    const client = new Ollama();
    console.log("Recieved Client");

    ws.audioDataArray = [];
    ws.tempFiles = [];

    ws.on('message', async (message) => {

        const data = JSON.parse(message)
        // console.log(data);
        if (data.type == "start_audio") {
            console.log("Streaming started");
        } else if (data.type == "stop_audio") {
            console.log("Stopping streaming session");

            //Temp directory creation:
            const tempDir = path.join(__dirname, "temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            ws.audioDataArray.forEach((buffer, index) => {
                console.log(index);
                const tempFilePath = path.join(tempDir, `chunk-${index++}.wav`);
                fs.writeFileSync(tempFilePath, buffer);
                ws.tempFiles.push(tempFilePath);
            })

            console.log(ws.tempFiles);

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


            const formData = new FormData();
            formData.append('audio', fs.createReadStream(combinedFilePath), {
                filename: 'recording.wav',
                contentType: 'audio/wav',
            });

            const Whisper_res = await axios.post('http://localhost:8000/transcribe', formData)
            // res.data.text contains the transciption
            console.log(Whisper_res.data.text);
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

                if (pendingText.length > 20 && pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!')) {
                    streamTTS(pendingText, ws);
                    pendingText = '';
                }
                ws.send(payload)
            }
            ws.send('stream_llm_end')


        } else if (data.type == "stream_audio") {
            if (typeof data.audio_data == "string") {
                const audioData = Buffer.from(data.audio_data.split(",")[1], "base64");
                console.log(`Received audio data chunk of length: ${audioData.length}`);
                ws.audioDataArray.push(audioData);
            } else {
                console.error("Invalid audio data format");
            }
        }
    })
})