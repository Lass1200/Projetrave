import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AudioClip } from '../../types'

interface ClipsState {
    clips: AudioClip[]
}

const initialState: ClipsState = {
    clips: []
}

const clipsSlice = createSlice({
    name: 'clips',
    initialState,
    reducers: {
        addClip: (state, action: PayloadAction<AudioClip>) => {
            state.clips.push(action.payload)
        },
        deleteClip: (state, action: PayloadAction<string>) => {
            state.clips = state.clips.filter(c => c.id !== action.payload)
        }
    }
})

export const { addClip, deleteClip } = clipsSlice.actions
export default clipsSlice.reducer