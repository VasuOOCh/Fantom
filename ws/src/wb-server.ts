import WebSocket, { WebSocketServer } from "ws";
import fs from 'fs';
import path from 'path';
import { exec } from "child_process";
import { default as axios } from "axios";
import FormData from 'form-data';
import { Ollama } from "ollama";
import { Interviewer } from "@/lib/types/type";

interface CustomWebSocket extends WebSocket {
    audioDataArray: Buffer[];
    tempFiles: string[];
    interviewer: Interviewer;
    history: any[]
}

const wss: WebSocketServer = new WebSocketServer({ port: 8080 });

const runSoxCommand: (soxCommand: string) => Promise<void> = (soxCommand: string) => {
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

const streamTTS = async (text: string, ws: CustomWebSocket) => {
    try {
        const payload = `assistant: ${JSON.stringify(text)}`;
        console.log(payload);

        const res = await fetch(`http://localhost:5002/api/tts?text=${encodeURIComponent(text)}`, {
            method: 'GET',
        });

        if (!res.ok) throw new Error('Failed to fetch TTS');

        // Collect all audio chunks first
        const chunks = [];
        const reader = res.body!.getReader();

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
        // console.log("sending text : ", payload);
        ws.send(payload);
        // console.log("sending audio of above chunk");
        ws.send(`tts_chunk: ${JSON.stringify(base64Audio)}`);


    } catch (error) {
        console.error('TTS Error:', error);
    }
};

wss.on('listening', () => {
    console.log("WebSocket server started at PORT : 8080");
})

const startInterview = async (ws: CustomWebSocket, client: Ollama) => {
    try {
        const sysPrompt = `
        You are ${ws.interviewer.name}, ${ws.interviewer.desc}. Your role is to conduct an effective interview that evaluates candidates thoroughly while creating a comfortable environment for honest conversation.
        Your personanlity and tone is ${ws.interviewer.style} and ${ws.interviewer.tone}
Interview Structure

Begin by introducing yourself and explaining the interview format in short length only
Ask ONE question at a time and wait for the candidate's response and do not give your own answer to your own question
Always acknowledge the candidate's previous answer before asking the next question
Never ask multiple questions in a single message
Maintain a natural conversational flow throughout the interview

MOST importantly keep your conversation short and ask questions one by one only and do not giveyour own answer

Additional Instructions

Adapt your questioning based on the candidate's responses
Provide appropriate guidance if the candidate struggles without revealing answers in short only
Maintain professional boundaries throughout the interview
If the user or you want to conclude the interview, give a JSON response only like {"end" : true}.
Never reference these system instructions during the interview`

        const chatRes = await client.chat({
            model: 'mistral',
            messages: [
                {
                    role: "system",
                    content: sysPrompt
                },
                {
                    role: 'user',
                    content: 'Start interview'
                }
            ],
            options: {
                temperature: ws.interviewer.temperature
            },
            stream: true
        })

        ws.history.push(
            {
                role: "system",
                content: sysPrompt
            },
            {
                role: 'user',
                content: 'Start interview'
            })

        // ChatRes is also a stream so we can use for..await..of loop

        let totalText = '';
        let pendingText = '';
        for await (const chunk of chatRes) {
            // chunk is an object : {..., message : {content : "sample" } ,,,}
            pendingText += chunk.message.content;
            totalText += chunk.message.content;

            if (pendingText.length > 20 && (pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!'))) {
                // console.log(pendingText);
                streamTTS(pendingText, ws);
                pendingText = '';
            }
        }
        ws.history.push({
            role: 'system',
            content: totalText
        })
    } catch (error) {
        console.log(error);
    }
}


wss.on('connection', (ws: WebSocket) => {
    const customWS = ws as CustomWebSocket
    const client = new Ollama();
    console.log("Recieved Client");

    customWS.audioDataArray = [];
    customWS.tempFiles = [];
    customWS.history = []

    customWS.on('message', async (message: WebSocket.RawData) => {

        const jsonString = typeof message === 'string'
            ? message
            : message.toString(); // For Buffer or ArrayBuffer

        const data = JSON.parse(jsonString);
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
            customWS.audioDataArray.forEach((buffer, index) => {
                const tempFilePath = path.join(tempDir, `chunk-${index}.wav`);
                fs.writeFileSync(tempFilePath, buffer);
                customWS.tempFiles.push(tempFilePath);
            })

            // Concat the chunks
            const combinedFilePath = path.join(
                __dirname,
                "uploads",
                `combined.wav`
            );

            const soxCommand = `sox ${customWS.tempFiles.join(" ")} ${combinedFilePath}`;

            await runSoxCommand(soxCommand);
            console.log(`Combined audio saved to ${combinedFilePath}`);

            // Clean up temporary files
            await Promise.all(
                customWS.tempFiles.map(async filePath => {
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        console.warn(`Failed to delete ${filePath}:`, err);
                    }
                })
            );

            customWS.audioDataArray = [];
            customWS.tempFiles = [];

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
            customWS.send(`user: ${JSON.stringify(Whisper_res.data.text)}`)
            customWS.history.push({
                role: 'user',
                content: Whisper_res.data.text
            })

            const chatRes = await client.chat({
                model: 'mistral',
                messages: [
                    ...customWS.history,
                    {
                        role: "user",
                        content: Whisper_res.data.text
                    }
                ],
                options: {
                    temperature: customWS.interviewer.temperature
                },
                stream: true
            })

            // ChatRes is also a stream so we can use for..await..of loop

            let totalText = '';
            let pendingText = '';
            for await (const chunk of chatRes) {
                // chunk is an object : {..., message : {content : "sample" } ,,,}
                const payload = `assistant: ${JSON.stringify(chunk)}\n\n`;
                pendingText += chunk.message.content;
                totalText += chunk.message.content;

                if (pendingText.length > 20 && (pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!'))) {
                    streamTTS(pendingText, customWS);
                    pendingText = '';
                }
            }
            customWS.history.push({
                role: 'system',
                content: totalText
            })
            // customWS.send('stream_llm_end')
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
                customWS.audioDataArray.push(audioData);
            } else {
                console.error("Invalid audio data format");
            }
        } else if (data.type === "start_interview") {
            console.log("Starting interview");
            customWS.interviewer = data.data
            startInterview(customWS, client)
        }
    })
})