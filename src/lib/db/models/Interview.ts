import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema({
    interviewer: {
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },             // Short description of the interviewer
        style: {
            type: String,
            enum: ['Friendly', 'Tough', 'Challenging', 'Supportive', 'Mentor', 'Rapid-fire'],
            default: 'Friendly',
        },
        tone: {
            type: String,
            enum: ['formal', 'casual', 'neutral', 'mentor-like'],
            default: 'neutral',
        },             // "formal", "casual", "mentor", etc. – guides LLM response tone
        temperature: {
            type: Number,
            default: 0.7,
        },     // LLM creativity level (0.2 for deterministic, 0.8 for exploratory)
    },
    resume: {
        type: mongoose.Types.ObjectId,
        ref: 'Resume',
    },
    topics: [
        {
            type: String
        }
    ],
    score: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    isEnded : {
        type :Boolean,
        default : false
    }
}, {
    timestamps: true
})

export default mongoose.models.Interview || mongoose.model('Interview', InterviewSchema)