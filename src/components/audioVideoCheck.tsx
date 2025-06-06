import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Separator } from './ui/separator'
import { CircleCheck, Ban, Mic, MicOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress'
import { Label } from './ui/label'

const AudioVIdeoCheck = ({ deviceIdsAndSetters }: { deviceIdsAndSetters: any }) => {
    const { currentAudioDeviceId, setCurrentAudioDeviceId, currentVideoDeviceId, setCurrentVideoDeviceId, isVideoOff, setIsVideoOff } = deviceIdsAndSetters;
    const currentInterval = useRef<any>(undefined);
    const [isMuted, setIsMuted] = useState(false);
    const [audioPermission, setAudioPermission] = useState<boolean>(false);
    const [audioValue, setAudioValue] = useState(0);
    const audioStream = useRef<MediaStream | null>(null);
    const [audioDevices, setAudioDevices] = useState<any[]>([])

    const [videoPermission, setVideoPermission] = useState<boolean>(false);
    const videoStream = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoDevice, setVideoDevices] = useState<any[]>([]);


    const execAudioFunction = async () => {
        const audioDevices = (await navigator.mediaDevices.enumerateDevices())
            .filter((device) => device.kind === "audioinput")
            .map(device => ({
                name: device.label || "Default", // fallback label
                deviceId: device.deviceId,
                groupId: device.groupId
            }));

        setAudioDevices(audioDevices);

        if (audioDevices.length > 0) {
            audioStream.current = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: audioDevices[0].deviceId } }
            });
            setAudioPermission(true);
            setCurrentAudioDeviceId(audioDevices[0].deviceId);
        }
    };

    const execVideoFunction = async () => {
        const videoDevices = (await navigator.mediaDevices.enumerateDevices())
            .filter((device) => device.kind === "videoinput")
            .map(device => ({
                name: device.label || "Default", // fallback label
                deviceId: device.deviceId,
                groupId: device.groupId
            }));

        setVideoDevices(videoDevices);

        if (videoDevices.length > 0) {
            videoStream.current = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: videoDevices[0].deviceId } }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream.current;
            }
             // since isVideoOff is true initially, we are diabling the video tracks for the first time
            videoStream.current.getVideoTracks().forEach((track) => track.enabled = false);

            setVideoPermission(true);
            setCurrentVideoDeviceId(videoDevices[0].deviceId);
        }
    };

    useEffect(() => {
        const audioPermission = async () => {
            try {
                const audioPermission = await navigator.permissions.query({ name: 'microphone' });
                // console.log(audioPermission);

                if (audioPermission.state == "granted") {
                    console.log("Audio Permission already granted");
                    execAudioFunction()

                } else if (audioPermission.state == "denied") {
                    alert("Please give audio permissions from the setting tab and reload the page")
                    setAudioPermission(false);
                } else {
                    // ask for permission (state == "prompt")
                    audioStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (audioStream.current.active) {
                        execAudioFunction()

                    } else {
                        alert("Please give audio permissions from the setting tab and reload the page");
                        return;
                    }

                }
            } catch (error) {
                console.log(error);
            }
        }

        const videoPermission = async () => {

            const videoPermission = await navigator.permissions.query({ name: 'camera' });


            if (videoPermission.state == "granted") {
                console.log("Video Permission already granted");
                execVideoFunction()
            } else if (videoPermission.state == "denied") {
                alert("Please give video permissions from the setting tab and reload the page")
                setVideoPermission(false);
            } else {
                // ask for permission (state == "prompt")
                videoStream.current = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoStream.current.active) {
                    execVideoFunction()
                } else {
                    alert("Please give video permissions from the setting tab and reload the page");
                    return;
                }
            }
        }
        audioPermission();
        videoPermission();

        // the above functions are aynchronous so the below function may not work properly

    }, [])

    // Do not try to understand the code
    // Ref : https://www.webrtc-developers.com/how-to-know-if-my-microphone-works/
    const checkAudio = (audioStream: MediaStream) => {
        try {
            const audioContext = new AudioContext();
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 512;
            analyzer.smoothingTimeConstant = 0.1;
            const sourceNode = audioContext.createMediaStreamSource(audioStream);
            sourceNode.connect(analyzer);

            if (currentInterval.current != undefined) {
                window.clearInterval(currentInterval.current);
            }

            const interval = setInterval(() => {
                // Compute the max volume level (-Infinity...0)
                const fftBins = new Float32Array(analyzer.frequencyBinCount); // Number of values manipulated for each sample
                analyzer.getFloatFrequencyData(fftBins);
                // audioPeakDB varies from -Infinity up to 0
                const audioPeakDB = Math.max(...fftBins);
                const frequencyRangeData = new Uint8Array(analyzer.frequencyBinCount);
                analyzer.getByteFrequencyData(frequencyRangeData);
                const sum = frequencyRangeData.reduce((p, c) => p + c, 0);
                // audioMeter varies from 0 to 10
                const audioMeter = Math.sqrt(sum / frequencyRangeData.length);
                // console.log(audioMeter);
                setAudioValue(audioMeter)
            }, 100);
            currentInterval.current = interval;
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        try {

            const muteUnmute = () => {
                if (isMuted) {
                    audioStream.current?.getAudioTracks().forEach((track) => track.enabled = false);
                } else {
                    audioStream.current?.getAudioTracks().forEach((track) => track.enabled = true);
                }
            }
            if (audioStream.current) {
                muteUnmute();
            }
        } catch (error) {
            console.log(error);
        }
    }, [isMuted, audioStream.current]);

    useEffect(() => {
        try {
            const videoOffOn = () => {
                if (isVideoOff) {
                    videoStream.current?.getVideoTracks().forEach((track) => track.enabled = false);
                } else {
                    videoStream.current?.getVideoTracks().forEach((track) => track.enabled = true);
                }
            }
            if (videoStream.current) {
                videoOffOn();
            }
        } catch (error) {
            console.log(error);
        }
    }, [isVideoOff, videoStream.current]);


    const handleAudioChange = async (value: string) => {
        try {
            const newAudioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: value }
                }
            })

            audioStream.current?.getAudioTracks().forEach(track => track.stop());
            audioStream.current = newAudioStream;
            checkAudio(audioStream.current);
            setCurrentAudioDeviceId(value);
            console.log("Audio Device changed");

        } catch (error) {
            console.log(error);

        }
    }

    const handleVideoChange = async (value: string) => {
        try {
            const newVideoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: value }
                }
            })

            videoStream.current?.getVideoTracks().forEach(track => track.stop());
            videoStream.current = newVideoStream;
            setCurrentVideoDeviceId(value);
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream.current;
            }
            console.log("Video Device changed");

        } catch (error) {
            console.log(error);

        }
    }
    return (
        <Card className='w-[30%]'>
            <CardHeader>
                <CardTitle className='text-2xl'>
                    Audio and Video settings
                </CardTitle>
                <CardDescription>
                    Ensure your microphone and camera are working correctly.
                </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label className='text-lg'>Microphone</Label>
                    {
                        audioPermission ? (
                            <p className='text-sm text-green-600 flex items-center gap-2'>
                                <CircleCheck size={18} />
                                <span>Audio Permission granted</span>
                            </p>
                        ) : (
                            <p className='text-sm text-red-600 flex items-center gap-2'>
                                <Ban size={18} />
                                <span>Audio Permission denied</span>
                            </p>
                        )
                    }
                    <Select value={currentAudioDeviceId} onValueChange={(value) => {
                        handleAudioChange(value);
                    }}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder={currentAudioDeviceId != null ? currentAudioDeviceId : "Please select an audio device"} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                audioDevices.map((device) => (
                                    <SelectItem value={device.deviceId} key={device.deviceId} >{device.name}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>

                    {/* Mic progess bar and Mute btn */}
                    <div className='flex items-center gap-2'>
                        {
                            isMuted ? <MicOff onClick={() => setIsMuted(!isMuted)} /> : <Mic onClick={() => setIsMuted(!isMuted)} />
                        }
                        <Progress value={audioValue * 10} />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label className='text-lg'>Camera</Label>
                    {
                        videoPermission ? (
                            <p className='text-sm text-green-600 flex items-center gap-2'>
                                <CircleCheck size={18} />
                                <span>Video Permission granted</span>
                            </p>
                        ) : (
                            <p className='text-sm text-red-600 flex items-center gap-2'>
                                <Ban size={18} />
                                <span>Video Permission denied</span>
                            </p>
                        )
                    }
                    <Select value={currentVideoDeviceId} onValueChange={(value) => handleVideoChange(value)}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder={videoDevice.length > 0 ? videoDevice[0].name : "Please select a video device"} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                videoDevice.map((device) => (
                                    <SelectItem value={device.deviceId} key={device.deviceId} >{device.name}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                    <div className='h-[300px] bg-accent'>
                        <video className='h-full w-full rounded-2xl ' autoPlay ref={videoRef}></video>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <Switch checked={!isVideoOff} onCheckedChange={(event) => {
                            setIsVideoOff(!event.valueOf())
                        }} />
                        <label htmlFor="">Enable Camera</label>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <CardDescription>These options cannot be changed during the interview so kindly setup your devices.</CardDescription>
            </CardFooter>
        </Card>
    )
}

export default AudioVIdeoCheck