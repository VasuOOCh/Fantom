"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var axios_1 = __importDefault(require("axios"));
var form_data_1 = __importDefault(require("form-data"));
var ollama_1 = require("ollama");
var wss = new ws_1.WebSocketServer({ port: 8080 });
var runSoxCommand = function (soxCommand) {
    return new Promise(function (resolve, reject) {
        (0, child_process_1.exec)(soxCommand, function (error, stdout, stderr) {
            if (error) {
                console.error("Error executing sox: ".concat(error));
                reject(error);
                return;
            }
            console.log(stdout);
            console.error(stderr);
            resolve();
        });
    });
};
var streamTTS = function (text, ws) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, res, chunks, reader, _a, value, done, totalLength_1, combined_1, offset_1, base64Audio, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                payload = "assistant: ".concat(JSON.stringify(text));
                console.log(payload);
                return [4 /*yield*/, fetch("http://localhost:5002/api/tts?text=".concat(encodeURIComponent(text)), {
                        method: 'GET',
                    })];
            case 1:
                res = _b.sent();
                if (!res.ok)
                    throw new Error('Failed to fetch TTS');
                chunks = [];
                reader = res.body.getReader();
                _b.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 4];
                return [4 /*yield*/, reader.read()];
            case 3:
                _a = _b.sent(), value = _a.value, done = _a.done;
                if (done)
                    return [3 /*break*/, 4];
                chunks.push(value);
                return [3 /*break*/, 2];
            case 4:
                totalLength_1 = 0;
                chunks.forEach(function (chunk) {
                    totalLength_1 += chunk.length;
                });
                combined_1 = new Uint8Array(totalLength_1);
                offset_1 = 0;
                chunks.forEach(function (chunk) {
                    combined_1.set(chunk, offset_1);
                    offset_1 += chunk.length;
                });
                base64Audio = Buffer.from(combined_1).toString('base64');
                // console.log("sending text : ", payload);
                ws.send(payload);
                // console.log("sending audio of above chunk");
                ws.send("tts_chunk: ".concat(JSON.stringify(base64Audio)));
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('TTS Error:', error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
wss.on('listening', function () {
    console.log("WebSocket server started at PORT : 8080");
});
var startInterview = function (ws, client) { return __awaiter(void 0, void 0, void 0, function () {
    var sysPrompt, chatRes, totalText, pendingText, _a, chatRes_1, chatRes_1_1, chunk, e_1_1, error_2;
    var _b, e_1, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 14, , 15]);
                sysPrompt = "\n        You are ".concat(ws.interviewer.name, ", ").concat(ws.interviewer.desc, ". Your role is to conduct an effective interview that evaluates candidates thoroughly while creating a comfortable environment for honest conversation.\n        Your personanlity and tone is ").concat(ws.interviewer.style, " and ").concat(ws.interviewer.tone, "\nInterview Structure\n\nBegin by introducing yourself and explaining the interview format in short length only\nAsk ONE question at a time and wait for the candidate's response and do not give your own answer to your own question\nAlways acknowledge the candidate's previous answer before asking the next question\nNever ask multiple questions in a single message\nMaintain a natural conversational flow throughout the interview\n\nMOST importantly keep your conversation short and ask questions one by one only and do not giveyour own answer\n\nAdditional Instructions\n\nAdapt your questioning based on the candidate's responses\nProvide appropriate guidance if the candidate struggles without revealing answers in short only\nMaintain professional boundaries throughout the interview\nIf the user or you want to conclude the interview, give a JSON response only like {\"end\" : true}.\nNever reference these system instructions during the interview");
                return [4 /*yield*/, client.chat({
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
                    })];
            case 1:
                chatRes = _e.sent();
                ws.history.push({
                    role: "system",
                    content: sysPrompt
                }, {
                    role: 'user',
                    content: 'Start interview'
                });
                totalText = '';
                pendingText = '';
                _e.label = 2;
            case 2:
                _e.trys.push([2, 7, 8, 13]);
                _a = true, chatRes_1 = __asyncValues(chatRes);
                _e.label = 3;
            case 3: return [4 /*yield*/, chatRes_1.next()];
            case 4:
                if (!(chatRes_1_1 = _e.sent(), _b = chatRes_1_1.done, !_b)) return [3 /*break*/, 6];
                _d = chatRes_1_1.value;
                _a = false;
                chunk = _d;
                // chunk is an object : {..., message : {content : "sample" } ,,,}
                pendingText += chunk.message.content;
                totalText += chunk.message.content;
                if (pendingText.length > 20 && (pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!'))) {
                    // console.log(pendingText);
                    streamTTS(pendingText, ws);
                    pendingText = '';
                }
                _e.label = 5;
            case 5:
                _a = true;
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 13];
            case 7:
                e_1_1 = _e.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 13];
            case 8:
                _e.trys.push([8, , 11, 12]);
                if (!(!_a && !_b && (_c = chatRes_1.return))) return [3 /*break*/, 10];
                return [4 /*yield*/, _c.call(chatRes_1)];
            case 9:
                _e.sent();
                _e.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 12: return [7 /*endfinally*/];
            case 13:
                ws.history.push({
                    role: 'system',
                    content: totalText
                });
                return [3 /*break*/, 15];
            case 14:
                error_2 = _e.sent();
                console.log(error_2);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
wss.on('connection', function (ws) {
    var customWS = ws;
    var client = new ollama_1.Ollama();
    console.log("Recieved Client");
    customWS.audioDataArray = [];
    customWS.tempFiles = [];
    customWS.history = [];
    customWS.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var jsonString, data, tempDir_1, combinedFilePath, soxCommand, formData, Whisper_res, chatRes, totalText, pendingText, _a, chatRes_2, chatRes_2_1, chunk, payload, e_2_1, audioData;
        var _b, e_2, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    jsonString = typeof message === 'string'
                        ? message
                        : message.toString();
                    data = JSON.parse(jsonString);
                    if (!(data.type == "start_audio")) return [3 /*break*/, 1];
                    console.log("Streaming of Client audio started");
                    return [3 /*break*/, 19];
                case 1:
                    if (!(data.type == "stop_audio")) return [3 /*break*/, 18];
                    console.log("Stopping cliient streaming session");
                    tempDir_1 = path_1.default.join(__dirname, "temp");
                    if (!fs_1.default.existsSync(tempDir_1)) {
                        fs_1.default.mkdirSync(tempDir_1);
                    }
                    // Write the buffers in temp files
                    customWS.audioDataArray.forEach(function (buffer, index) {
                        var tempFilePath = path_1.default.join(tempDir_1, "chunk-".concat(index, ".wav"));
                        fs_1.default.writeFileSync(tempFilePath, buffer);
                        customWS.tempFiles.push(tempFilePath);
                    });
                    combinedFilePath = path_1.default.join(__dirname, "uploads", "combined.wav");
                    soxCommand = "sox ".concat(customWS.tempFiles.join(" "), " ").concat(combinedFilePath);
                    return [4 /*yield*/, runSoxCommand(soxCommand)];
                case 2:
                    _e.sent();
                    console.log("Combined audio saved to ".concat(combinedFilePath));
                    // Clean up temporary files
                    return [4 /*yield*/, Promise.all(customWS.tempFiles.map(function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
                            var err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, fs_1.default.promises.unlink(filePath)];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        console.warn("Failed to delete ".concat(filePath, ":"), err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    // Clean up temporary files
                    _e.sent();
                    customWS.audioDataArray = [];
                    customWS.tempFiles = [];
                    formData = new form_data_1.default();
                    formData.append('audio', fs_1.default.createReadStream(combinedFilePath), {
                        filename: 'recording.wav',
                        contentType: 'audio/wav',
                    });
                    return [4 /*yield*/, axios_1.default.post('http://localhost:8000/transcribe', formData)
                        // res.data.text contains the transciption
                        // [1]   error: 'Whisper transcription failed',
                        // [1]   details: 'CUDA error: unspecified launch failure\n' +
                        // [1]     'CUDA kernel errors might be asynchronously reported at some other API call, so the stacktrace below might be incorrect.\n' +
                        // [1]     'For debugging consider passing CUDA_LAUNCH_BLOCKING=1\n' +
                        // [1]     'Compile with `TORCH_USE_CUDA_DSA` to enable device-side assertions.\n'
                        // [1] 
                        // console.log(Whisper_res.data);
                    ];
                case 4:
                    Whisper_res = _e.sent();
                    // res.data.text contains the transciption
                    // [1]   error: 'Whisper transcription failed',
                    // [1]   details: 'CUDA error: unspecified launch failure\n' +
                    // [1]     'CUDA kernel errors might be asynchronously reported at some other API call, so the stacktrace below might be incorrect.\n' +
                    // [1]     'For debugging consider passing CUDA_LAUNCH_BLOCKING=1\n' +
                    // [1]     'Compile with `TORCH_USE_CUDA_DSA` to enable device-side assertions.\n'
                    // [1] 
                    // console.log(Whisper_res.data);
                    customWS.send("user: ".concat(JSON.stringify(Whisper_res.data.text)));
                    customWS.history.push({
                        role: 'user',
                        content: Whisper_res.data.text
                    });
                    return [4 /*yield*/, client.chat({
                            model: 'mistral',
                            messages: __spreadArray(__spreadArray([], customWS.history, true), [
                                {
                                    role: "user",
                                    content: Whisper_res.data.text
                                }
                            ], false),
                            options: {
                                temperature: customWS.interviewer.temperature
                            },
                            stream: true
                        })
                        // ChatRes is also a stream so we can use for..await..of loop
                    ];
                case 5:
                    chatRes = _e.sent();
                    totalText = '';
                    pendingText = '';
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 11, 12, 17]);
                    _a = true, chatRes_2 = __asyncValues(chatRes);
                    _e.label = 7;
                case 7: return [4 /*yield*/, chatRes_2.next()];
                case 8:
                    if (!(chatRes_2_1 = _e.sent(), _b = chatRes_2_1.done, !_b)) return [3 /*break*/, 10];
                    _d = chatRes_2_1.value;
                    _a = false;
                    chunk = _d;
                    payload = "assistant: ".concat(JSON.stringify(chunk), "\n\n");
                    pendingText += chunk.message.content;
                    totalText += chunk.message.content;
                    if (pendingText.length > 20 && (pendingText.endsWith('.') || pendingText.endsWith(',') || pendingText.endsWith('?') || pendingText.endsWith('!'))) {
                        streamTTS(pendingText, customWS);
                        pendingText = '';
                    }
                    _e.label = 9;
                case 9:
                    _a = true;
                    return [3 /*break*/, 7];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _e.trys.push([12, , 15, 16]);
                    if (!(!_a && !_b && (_c = chatRes_2.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, _c.call(chatRes_2)];
                case 13:
                    _e.sent();
                    _e.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17:
                    customWS.history.push({
                        role: 'system',
                        content: totalText
                    });
                    return [3 /*break*/, 19];
                case 18:
                    if (data.type == "stream_audio") {
                        if (typeof data.audio_data == "string") {
                            audioData = Buffer.from(data.audio_data.split(",")[1], "base64");
                            /*
                            Buffer is save in RAM and used only in NodeJS
             
                            Blob is not used here it is HTML specific and is used to represent images/video
                            (Blob can also be created in NodejS but not famous though !)
             
                            It is direct binary representation of data (eg .wav audio file)
                            You can save it as fs.writeFileSync('audio.wav', audioData);
                            OR you can send it as Response
                            */
                            console.log("Received audio data chunk of length: ".concat(audioData.length));
                            customWS.audioDataArray.push(audioData);
                        }
                        else {
                            console.error("Invalid audio data format");
                        }
                    }
                    else if (data.type === "start_interview") {
                        console.log("Starting interview");
                        customWS.interviewer = data.data;
                        startInterview(customWS, client);
                    }
                    _e.label = 19;
                case 19: return [2 /*return*/];
            }
        });
    }); });
});
