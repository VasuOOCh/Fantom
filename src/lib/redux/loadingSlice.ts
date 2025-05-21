import { createSlice } from "@reduxjs/toolkit"

interface LoadingType {
    loading : boolean
}

const initialState : LoadingType = {
    loading : false
}

export const LoaderSlice = createSlice({
    name : "loadingSlice",
    initialState,
    reducers : {
        setLoadingState : (state, action) => {
            state.loading = action.payload
        }
    }
})

export const {setLoadingState} = LoaderSlice.actions
export default LoaderSlice.reducer

