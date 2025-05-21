import dbConnect from "@/lib/db/dbConnect";
import User from "@/lib/db/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        await dbConnect();
        const existingUser = await User.findById(data.uid)

        if (!existingUser) {
            // console.log("Creating new User");
            const newUser = new User({
                ...data,
                _id: data.uid
            })
            await newUser.save()
        }

        return NextResponse.json("User created", {
            status: 200
        })

    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {
            status: 500,
            statusText: 'Failed to create a new User'
        })
    }
}