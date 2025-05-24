import React, { RefObject } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'

const AudioVIdeoConfig = ({ currentVideoDeviceId, setCurrentVideoDeviceId, videoStream, videoRef, videoDevice }: { currentVideoDeviceId: string | undefined, setCurrentVideoDeviceId: React.Dispatch<React.SetStateAction<string | undefined>>, videoStream: RefObject<MediaStream | null>, videoRef: RefObject<HTMLVideoElement | null>, videoDevice: any[] }) => {
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
        <div className='flex flex-col gap-4'>
            <div className='flex gap-2 flex-col'>
                <Label>Video</Label>
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
            </div>
            {/* <div className='flex gap-2 flex-col'>
                <Label>Audio</Label>
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
            </div> */}
        </div>
    )
}

export default AudioVIdeoConfig