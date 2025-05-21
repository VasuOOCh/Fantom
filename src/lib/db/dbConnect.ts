'use server'
import mongoose, { Mongoose } from 'mongoose'

const mongoURI = "mongodb+srv://vasu2005choudhari:i7pCjQYgbNpez9nu@intervieww.xei6grq.mongodb.net/testDB?retryWrites=true&w=majority&appName=Intervieww"
declare global {
    var mongoose: {
        conn: Mongoose | null,
    };
}
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null}
}

async function dbConnect() {
    if (cached.conn) {
        console.log("Already connected to DB");
    }else {
        console.log("Establishing new DB conncetion");
        cached.conn = await mongoose.connect(mongoURI);
    }
}

export default dbConnect;