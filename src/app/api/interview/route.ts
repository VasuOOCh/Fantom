import dbConnect from "@/lib/db/dbConnect";
import Interview from "@/lib/db/models/Interview";
import User from "@/lib/db/models/User";
import { adminAuth } from "@/lib/firebase/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {

        // check authorization  : 
        const sessionCookie = req.cookies.get('session')?.value;
        if (!sessionCookie) {
            return NextResponse.json("NO SESSION FOUND", {
                status: 400,
                statusText: "INVALID AUTH"
            })
        }
        const auth = await adminAuth.verifySessionCookie(sessionCookie as string, true);
        // console.log(auth);

        await dbConnect();
        // check the session Cookie : 

        const data = await req.json();
        const newInterview = new Interview({
            ...data,
            candidate : auth.uid
        })
        await newInterview.save();
        const updatedUser = await User.findByIdAndUpdate(auth.uid, {
            $push : {interviews : newInterview}
        }, {new : true})
        console.log(updatedUser);
        // console.log(newInterview);
        const interviewId = newInterview._id;
        return NextResponse.json({
            interviewId
        }, {
            status: 200,
            statusText: 'Interview OK'
        })
    } catch (error: any) {
        console.log(error);
        if(error.code === "auth/argument-error") {
            return NextResponse.json("INVALID SESSION", {
                status : 400,
                statusText : "INVALID AUTH"
            })
        }
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

export async function PUT(req: NextRequest) {
    await dbConnect()
    console.log("runnning this");

    try {
        const data = await req.json();
        console.log(data);

        const updatedInterview = await Interview.findByIdAndUpdate(data.interviewId.current, {
            convo: data.convo,
            duration: data.duration[0] * 60 + data.duration[1],
            isEnded: true
        }, { new: true })

        console.log(updatedInterview);

        return NextResponse.json("ok", {
            status: 200,
            statusText: 'Interview End'
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json("error", {
            status: 500,
            statusText: 'Error in ending interview'
        })
    }
}