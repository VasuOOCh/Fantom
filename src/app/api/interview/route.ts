import dbConnect from "@/lib/db/dbConnect";
import Interview from "@/lib/db/models/Interview";
import { Search } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const data = await req.json();
        const newInterview = new Interview({
            ...data
        })
        await newInterview.save();
        console.log(newInterview);
        const interviewId = newInterview._id;
        return NextResponse.json({
            interviewId
        }, {
            status: 200,
            statusText: 'Interview OK'
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {
            status: 500,
            statusText: 'Failed to create new interview'
        })
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const interviewId = req.nextUrl.searchParams.get('interviewId');
        const interview = await Interview.findById(interviewId)

        if (!interview) {
            return NextResponse.json("No interview found", {
                status: 400,
                statusText: 'No interview found'
            })
        }

        return NextResponse.json(interview, {
            status: 200,
            statusText: "Interview oK"
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {
            status: 500,
            statusText: 'Error retireving interview'
        })
    }
}