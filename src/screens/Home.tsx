import { useState } from 'react'
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { setIp, setPort, setConnected } from '../store/serverSlice'
import { AppDispatch, RootState } from '../store/store'

export default function Home() {
    const dispatch = useDispatch<AppDispatch>()
    const { ip, port, isConnected } = useSelector((state: RootState) => state.server)
    const [loading, setLoading] = useState(false)

    const testConnection = async () => {
        setLoading(true)
        try {
            const response = await fetch(`http://${ip}:${port}/`)
            if (response.ok) {
                dispatch(setConnected(true))
                Alert.alert(' Connexion réussie !')
            } else {
                dispatch(setConnected(false))
                Alert.alert('Erreur de connexion')
            }
        } catch (e) {
            dispatch(setConnected(false))
            Alert.alert(' Serveur inaccessible (vraiment)')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion au serveur</Text>
            <TextInput
                style={styles.input}
                placeholder="Adresse IP"
                value={ip}
                onChangeText={(v) => dispatch(setIp(v))}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Port"
                value={port}
                onChangeText={(v) => dispatch(setPort(v))}
                keyboardType="numeric"
            />
            {loading
                ? <ActivityIndicator />
                : <Button title="Tester la connexion" onPress={testConnection} />
            }
            <Text style={styles.status}>
                {isConnected ? '🟢 Connecté' : '🔴 Non connecté'}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
    status: { marginTop: 20, textAlign: 'center', fontSize: 16 }
})