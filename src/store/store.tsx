import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from '@reduxjs/toolkit'
import clipsReducer from './clipsSlice'
import serverReducer from './serverSlice'

// Configuration de redux-persist — sauvegarde clips et server dans AsyncStorage
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['clips', 'server'] // slices à persister entre les sessions
}

// Combinaison des deux slices en un seul reducer global
const rootReducer = combineReducers({
    clips: clipsReducer,
    server: serverReducer
})

// Reducer enrichi avec la logique de persistance
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    // serializableCheck désactivé pour compatibilité avec redux-persist
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
})

export const persistor = persistStore(store)

// Types exportés pour typer useSelector et useDispatch dans les composants
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
