import dbConnect from "@/lib/db/dbConnect";
import User from "@/lib/db/models/User";
import { adminAuth } from "@/lib/firebase/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        // console.log(data);
        await dbConnect();
        const existingUser = await User.findById(data.userInfo.uid);
        
        if (!existingUser) {
            const newUser = new User({
                ...data.userInfo,
                _id: data.userInfo.uid
            })
            await newUser.save()
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(data.tokenId, {expiresIn});
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        const response = NextResponse.json({
            status : "success"
        }, {
            status : 200,
            statusText : "USER OK"
        })
        response.cookies.set('session', sessionCookie, options);
        return response;

    } catch (error) {
        console.log(error);
        return NextResponse.json(error, {
            status: 500,
            statusText: 'Failed signin/signup'
        })
    }
}