'use client'
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { FileText, ChartNoAxesColumn, CircleCheckBig, Users, CalendarDays, ArrowUpRight,TrendingUp } from 'lucide-react';
import Image from 'next/image';
import React from 'react'
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';

const cards = [
    {
        title: "Total Interviews",
        desc: "Conducted across all candidates",
        value: 150,
        extraVal: 15,
        icon: FileText
    },
    {
        title: "Avg. Performance Score",
        desc: "Overall average across all sessions",
        value: 75,
        extraVal: 2,
        icon: ChartNoAxesColumn
    },
    {
        title: "Completion Rate",
        desc: "Interviews completed out of scheduled",
        value: 92,
        extraVal: -1,
        icon: CircleCheckBig
    },
    {
        title: "Active Candidates",
        desc: "Candidates with recent activity",
        value: 45,
        icon: Users
    },
]

const recentInterviews = [
    {
        avatar: "/avatar.jpg",
        interviewer: "John Doe",
        score: 76,
        topics: ["Javascipt", "Speaking", "Typescript", "Coding"],
        date: "26/12/2025"
    }, {
        avatar: "/avatar.jpg",
        interviewer: "Jane Mira",
        score: 45,
        topics: ["Java", "Vibing", "Typescript", "Listening"],
        date: "26/12/2025"
    },
    {
        avatar: "/avatar.jpg",
        interviewer: "John Doe",
        score: 98,
        topics: ["Javascipt", "Speaking", "Typescript", "Coding"],
        date: "26/12/2025"
    },
    {
        avatar: "/avatar.jpg",
        interviewer: "Elon Musk",
        score: 34,
        topics: ["Java", "Vibing", "Typescript", "Listening"],
        date: "26/12/2025"
    }
]
const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const Dashboard = () => {
    return (
        <div className='p-8 flex flex-col gap-4'>
            {/* Heading */}
            <div>
                <h1 className='text-4xl font-bold'>Dashboard</h1>
                <p className='text-muted-foreground'>Overview of your AI mock interview platform.</p>
            </div>

            {/* Cards Content */}

            <div className='flex gap-8'>
                {
                    cards.map((card, index) => (
                        <Card key={index} className='flex-1'>
                            <CardHeader className='flex justify-between items-center'>
                                <CardTitle>{card.title}</CardTitle>
                                <card.icon />
                            </CardHeader>
                            <CardContent className='flex flex-col gap-1'>
                                <h2 className='text-3xl font-extrabold'>{card.value}</h2>
                                <CardDescription>{card.desc}</CardDescription>
                                {
                                    card.extraVal && (
                                        <h3 className='text-md text-green-400'>{card.extraVal}%</h3>
                                    )
                                }
                            </CardContent>
                        </Card>
                    ))
                }
            </div>

            {/* Recent Interview and Performance scores */}
            <div className='flex flex-row gap-4'>
                {/* Recent Interview */}
                <section className='w-[60%] flex flex-col gap-1'>
                    <h1 className='text-2xl font-semibold'>Recent Interviews</h1>
                    <div className=' flex flex-col gap-2'>
                        {
                            recentInterviews.map((data, index) => (
                                <Card key={index} className='p-4'>
                                    <CardContent className='flex items-center gap-8'>
                                        <div className='flex flex-col flex-1 gap-4'>
                                            <div className='flex gap-8 items-center'>
                                                <div className='relative w-10 h-10'>
                                                    <Image src={data.avatar} className='object-cover rounded-full' fill alt='Image' />
                                                </div>

                                                <div className='flex flex-col gap-1'>
                                                    <h3>{data.interviewer}</h3>
                                                    <p className='flex gap-1'>
                                                        <CalendarDays size={18} />
                                                        <span className='text-sm'>{data.date}</span>
                                                    </p>
                                                </div>

                                                <div className='flex-1 flex flex-col gap-1'>
                                                    <Badge>{data.score}</Badge>
                                                    <Progress value={data.score} />
                                                </div>


                                            </div>

                                            <div className='flex gap-2'>
                                                {data.topics.map((topic, index) => (
                                                    <Badge key={index}>{topic}</Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className='flex gap-1 bg-accent rounded-2xl px-2 py-1 items-center font-semibold'>
                                            <span>Analysis</span>
                                            <ArrowUpRight size={18} />
                                        </div>

                                    </CardContent>

                                </Card>
                            ))
                        }
                    </div>
                </section>

                {/* Performance overview */}
                <div className='w-[40%] flex flex-col gap-1'>
                    <h1 className='text-2xl font-semibold'>Score and Rank</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-xl'>Fantom score</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <div>

                                <h1 className='text-4xl font-extrabold'>168.34</h1>
                                <CardDescription>
                                    Fantom scores and calculated on basis of total interviews taken, material done and much more.
                                </CardDescription>
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className='text-xl'>Rank - 3402</CardTitle>
                            <CardDescription>January - June 2024</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className='h-[250px] w-full'>
                                <LineChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Line
                                        dataKey="desktop"
                                        type="natural"
                                        stroke="blue"
                                        strokeWidth={2}
                                        dot={{
                                            fill: "blue",
                                        }}
                                        activeDot={{
                                            r: 6,
                                        }}
                                    >
                                        <LabelList
                                            position="top"
                                            offset={12}
                                            className="fill-foreground"
                                            fontSize={12}
                                        />
                                    </Line>
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                
                    </Card>

                </div>
            </div>
        </div>
    )
}

export default Dashboard