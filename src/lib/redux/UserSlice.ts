import { createSlice } from '@reduxjs/toolkit'

interface UserState {
    user : {
        name : string,
        email : string,
        verified : boolean,
        provider : object,
        avatar : string,
        uid : string
    } | null,
}

const initialState : UserState = {
    user : null,
}

export const UserSlice = createSlice({
    name : 'userSlice',
    initialState,
    reducers : {
        setUser : (state,action) => {
            state.user = action.payload
        },
        clearUser : (state) => {
            state.user = null
        }
    }
})

export const {setUser,clearUser} = UserSlice.actions
export default UserSlice.reducer;