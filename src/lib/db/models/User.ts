import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    avatar : {
        type : String
    },
    name : {
        type : String
    },
    verfied : {
        type : Boolean,
        default : false
    },
    provider : {
        type : String
    }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)