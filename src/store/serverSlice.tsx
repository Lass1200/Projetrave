import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ServerState } from '../../types'

const initialState: ServerState = {
    ip: '',
    port: '',
    isConnected: false
}

const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
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