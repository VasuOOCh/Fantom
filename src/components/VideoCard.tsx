import React, {useEffect, useRef, useState } from 'react'
import { Switch } from './ui/switch';
import { Settings } from 'lucide-react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';
import AudioVIdeoConfig from './AudioVIdeoConfig';

const VideoCard = () => {
    const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState<undefined | string>(undefined);
    const [videoPermission, setVideoPermission] = useState<boolean>(false);
    const videoStream = useRef<MediaStream | null>(null);
    const [videoDevice, setVideoDevices] = useState<any[]>([]);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isVideoOff, setIsVideoOff] = useState(true);

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

        videoPermission();

        // the above functions are aynchronous so the below function may not work properly

    }, [])

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
    return (


        <div className='flex flex-col gap-2'>

            <div className='h-[300px] bg-accent relative'>
                <video className='h-full w-full rounded-2xl object-cover' autoPlay ref={videoRef}></video>
                <div className='absolute top-2 flex items-center justify-between w-full'>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className='bg-transparent' variant={"secondary"}>
                                <Settings />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle >Audio and Video Config</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <AudioVIdeoConfig currentVideoDeviceId={currentVideoDeviceId} setCurrentVideoDeviceId={setCurrentVideoDeviceId} videoDevice={videoDevice} videoRef={videoRef} videoStream={videoStream} />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className='absolute top-4 right-4'>
                        <Switch  checked={!isVideoOff} onCheckedChange={(event) => {
                            setIsVideoOff(!event.valueOf())
                        }} />
                    </div>
                </div>
            </div>

        </div>

    )
}

export default VideoCard