export interface AudioClip {
    id: string
    name: string
    uri: string
}

export interface ServerState {
    ip: string
    port: string
    isConnected: boolean
}

export type RootTabParamList = {
    Home: undefined
    Record: undefined
    RAVE: undefined
}