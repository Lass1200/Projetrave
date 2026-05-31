import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AudioClip } from '../../types'

// Interface du state — contient la liste de tous les clips enregistrés
interface ClipsState {
    clips: AudioClip[]
}

// State initial — aucun clip au démarrage
const initialState: ClipsState = {
    clips: []
}

// Slice gérant les clips audio enregistrés par l'utilisateur
const clipsSlice = createSlice({
    name: 'clips',
    initialState,
    reducers: {
        // Ajoute un nouveau clip dans la liste
        addClip: (state, action: PayloadAction<AudioClip>) => {
            state.clips.push(action.payload)
        },
        // Supprime un clip par son id
        deleteClip: (state, action: PayloadAction<string>) => {
            state.clips = state.clips.filter(c => c.id !== action.payload)
        }
    }
})

export const { addClip, deleteClip } = clipsSlice.actions
export default clipsSlice.reducer
