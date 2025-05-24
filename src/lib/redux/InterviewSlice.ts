import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Interviewer, message } from "../types/type";

interface Interview {
    live: boolean,
    interviewer: Interviewer | null,
    interviewId: null | string,
    convo: message[]
}

const initialState: Interview = {
    live: false,
    interviewer: null,
    interviewId: null,
    convo: []
}


export const InterviewSlice = createSlice({
    name: "InterviewSlice",
    initialState,
    reducers: {
        updateInterview: (state, action: PayloadAction<{ interviewer: Interviewer, interviewId: string }>) => {
            state.live = false;
            state.interviewer = action.payload.interviewer;
            state.interviewId = action.payload.interviewId;
            state.convo = [];
        },
        startInterview : (state) => {
            state.live = true;
        },
        insertUserConvo: (state, action: PayloadAction<string>) => {
            state.convo = [...state.convo, {
                role: 'user',
                content: action.payload
            }]
        },
        insertAssistantConvo: (state, action: PayloadAction<string>) => {
            state.convo = [...state.convo, {
                role: 'assistant',
                content: action.payload
            }]
        },
        appendAssitantConvo: (state, action: PayloadAction<string>) => {
            let prev = state.convo
            state.convo = prev.map((msg, index) => {
                if (index === prev.length - 1 && msg.role === "assistant") {
                    // Only modify the last assistant message
                    return { ...msg, content: msg.content + action.payload };
                }

                return msg;
            });
        },
        clearInterview: (state) => {
            state.live = false;
            state.interviewId = null;
            state.interviewer = null;
            state.convo = []
        }


    }
})

export default InterviewSlice.reducer
export const { clearInterview, updateInterview, startInterview, insertAssistantConvo, insertUserConvo, appendAssitantConvo } = InterviewSlice.actions