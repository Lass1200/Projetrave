import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from '@reduxjs/toolkit'
import clipsReducer from './clipsSlice'
import serverReducer from './serverSlice'

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['clips', 'server']
}

const rootReducer = combineReducers({
    clips: clipsReducer,
    server: serverReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch