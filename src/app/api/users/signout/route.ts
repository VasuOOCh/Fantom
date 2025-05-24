import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    try {
        const response = NextResponse.json("SIGNOUT OK", {
            status : 200,
            statusText : "SIGNOUT OK"
        })

        response.cookies.delete('session');
        return response;

    } catch (error) {
        console.log(error);
        return NextResponse.json("Signout failed in server side", {
            status : 500,
            statusText : "SIGNOUT FAILED"
        })
    }
}