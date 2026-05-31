import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ServerState } from '../../types'
// State initial — IP et port vides, non connecté au démarrage
const initialState: ServerState = {
    ip: '',
    port: '',
    isConnected: false
}
// ce slice gere donc la connexion au serveur python
const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
         // Met à jour l'adresse IP saisie par l'utilisateur
        setIp: (state, action: PayloadAction<string>) => {
            state.ip = action.payload
        },
        setPort: (state, action: PayloadAction<string>) => {
            state.port = action.payload
        },
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload
        }
    }
})

export const { setIp, setPort, setConnected } = serverSlice.actions
export default serverSlice.reducer
