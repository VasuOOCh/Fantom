import React from 'react'
import { CloudUpload, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const resumeList = [
    {
        filename: "Technicadcddfdfedfefrvdrvl.pdf",
        size: "350KB",
        date: "24/4/2025"
    },
    {
        filename: "JavaInterview.pdf",
        size: "1.1MB",
        date: "12/3/2025"
    },
    {
        filename: "Coding.pdf",
        size: "1.4MB",
        date: "2/1/2025"
    }

]

const resumes = () => {
    return (
        <div className='p-8 flex flex-col gap-4'>
            <h1 className='text-4xl font-bold'>Manage your resumes</h1>

            <div className='flex flex-col gap-8'>
                <div className='flex flex-col p-8 rounded-4xl border-3 border-dotted gap-4 items-center'>
                    <CloudUpload size={48} />
                    <h2 className='text-4xl font-semibold'>Upload New Resume</h2>
                    <p>Drag and drop your resume files here, or click the button below to select files from your computer.</p>
                    <Button className='flex gap-2 items-center'>
                        <Upload />
                        <span>Select Files</span>
                    </Button>
                </div>

                <div className='flex gap-8 flex-wrap'>
                    {
                        resumeList.map((resume, index) => (
                            <Card key={index} className='w-[300px]'>
                                <CardHeader className='flex flex-col gap-2'>
                                    <CardTitle className='truncate whitespace-nowrap overflow-hidden w-full'>{resume.filename}</CardTitle>
                                    <div className='flex gap-2 items-center'>
                                        <CardDescription>{resume.size}</CardDescription>
                                        <span>&#x2022;</span>
                                        <CardDescription>{resume.date}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className='flex items-center justify-center p-4'>
                                    <FileText size={64} />
                                </CardContent>
                                <CardFooter className='flex gap-4 justify-between'>
                                    <Button variant={"secondary"}>View</Button>
                                    <Button variant="destructive">Delete</Button>
                                </CardFooter>
                            </Card>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default resumes