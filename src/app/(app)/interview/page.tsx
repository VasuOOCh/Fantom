'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { technicalInterviewTopics } from '@/lib/data'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import AudioVIdeoCheck from '@/components/audioVideoCheck'
import axios from 'axios'
import { interviewers } from '@/lib/data'
import { Interviewer } from '@/lib/types/type'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { clearInterview } from '@/lib/redux/InterviewSlice'
import { toast } from 'sonner'

/* 
Documentation and Articles : 

const audioTracks = stream.getAudioTracks();

if (audioTracks.length === 0) {
    // No audio from microphone has been captured
    return;
}

// We asked for the microphone so one track
const track = audioTracks[0];
if (track.muted) {
    // Track is muted which means that the track is unable to provide media data.
    // When muted, a track can't be unmuted.
    // This track will no more provide data...
}

if (!track.enabled) {
    // Track is temporaly disabled (muted for telephonist) which means that the track provides silence instead of real data.
    // When disabled, a track can be enabled again.
    // When in that case, user can't be heard until track is enabled again.
}

if (track.readyState === "ended") {
    // Possibly a disconnection of the device
    // When ended, a track can't be active again
    // This track will no more provide data
}
*/

const resumes = ["resume1", "resume2", "resume3"]


const Interview = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState<undefined | string>(undefined);
    const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState<undefined | string>(undefined);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [loading, setLoading] = useState<boolean>(false);

    // Defining the form fields : 
    const [interviewer, setInterviewer] = useState<number>(1);
    const [resumeId, setResumeId] = useState<string | undefined>();
    const [topics, setTopics] = useState<string[]>([]);

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Save the audio and VideoSettings in a slice
            const { data } = await axios.post('http://localhost:3000/api/interview', {
                interviewer: interviewers[interviewer], resumeId, topics,
            })
            toast.success('New interview formed !', {
                description: 'Redirecting to interview'
            })

            if (data.interviewId) {
                // clear the prev Interview if exists : 
                dispatch(clearInterview());
                return router.push('/interview/' + data.interviewId);
            }


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className='p-8 flex flex-col gap-4'>
            <h1 className='text-4xl font-bold'>Start a new Mock Interview</h1>

            <div className='flex flex-row gap-8'>
                {/* Audio and Video settings */}
                <AudioVIdeoCheck deviceIdsAndSetters={{ currentAudioDeviceId, setCurrentAudioDeviceId, currentVideoDeviceId, setCurrentVideoDeviceId, isVideoOff, setIsVideoOff }} />

                {/* Interview Settings */}
                <Card className='w-[70%]'>
                    <CardHeader>
                        <CardTitle className='text-2xl'>
                            Interview Configuration
                        </CardTitle>
                        <CardDescription>
                            Select the interview configuration from below options.
                        </CardDescription>
                    </CardHeader>

                    <Separator />

                    <CardContent>
                        {/* Form */}
                        <div className='flex flex-col gap-4'>

                            <div className='flex flex-col gap-2'>
                                <Label className='text-lg'>Select your interviewer</Label>
                                <div className='flex gap-4'>
                                    {
                                        interviewers.map((data, index) => (
                                            <div className={`flex flex-col gap-2 items-center`} key={index} onClick={() => setInterviewer(data.id)}>
                                                <Image src={data.avatar} alt='avatar' height={100} width={100} className={`rounded-full object-cover avatar ${interviewer == data.id ? "ring-green-700 ring-4" : ""}`} />
                                                <Label>{data.name}</Label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label className='text-lg'>Select your resume</Label>
                                <div className='flex gap-4'>
                                    {
                                        resumes.map((resume, index) => (
                                            <div key={index} className='flex flex-col gap-2 items-center'>
                                                <div className='w-[150px] h-[100px] bg-accent rounded-2xl'></div>
                                                <Label>{resume}</Label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <Label className='text-lg'>Select topics to focus on</Label>
                                {
                                    Object.keys(technicalInterviewTopics).map((key, index) => (
                                        <div key={index} className='flex gap-4'>
                                            <Label>{key}</Label>
                                            <div className='flex gap-2'>
                                                {technicalInterviewTopics[key as keyof typeof technicalInterviewTopics].map((topic, index) => {
                                                    const isSelected = topics.includes(topic);
                                                    return (
                                                        <Toggle
                                                            key={index}
                                                            pressed={isSelected}
                                                            onClick={() =>
                                                                setTopics(prev =>
                                                                    isSelected
                                                                        ? prev.filter(item => item !== topic)
                                                                        : [...prev, topic]
                                                                )
                                                            }
                                                            variant="outline"
                                                            aria-label={`Toggle ${topic}`}
                                                            className="data-[state=on]:bg-accent data-[state=on]:border-accent-foreground data-[state=on]:shadow-inner"
                                                        >
                                                            {topic}
                                                        </Toggle>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <Button onClick={handleSubmit} disabled={loading}>{loading ? (<><Loader2 className="animate-spin" /> <span>Please wait</span></>) : "Start interview"}</Button>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <CardDescription>By clicking on start interview button you agree our terms and conditions.</CardDescription>
                    </CardFooter>
                </Card>
            </div>
        </div >
    )
}

export default Interview