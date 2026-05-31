import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { setIp, setPort, setConnected } from '../store/serverSlice'
import { AppDispatch, RootState } from '../store/store'
import { Ionicons } from '@expo/vector-icons'

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
                Alert.alert('Connexion réussie !')
            } else {
                dispatch(setConnected(false))
                Alert.alert('Erreur de connexion')
            }
        } catch (e) {
            dispatch(setConnected(false))
            Alert.alert('Serveur inaccessible')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Ionicons name="server-outline" size={60} color="#000" style={styles.icon} />
            <Text style={styles.title}>Connexion au serveur</Text>

            <View style={styles.inputWrapper}>
                <Ionicons name="globe-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Adresse IP"
                    value={ip}
                    onChangeText={(v) => dispatch(setIp(v))}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Port"
                    value={port}
                    onChangeText={(v) => dispatch(setPort(v))}
                    keyboardType="numeric"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <TouchableOpacity style={styles.button} onPress={testConnection}>
                    <Ionicons name="link-outline" size={20} color="white" />
                    <Text style={styles.buttonText}>Tester la connexion</Text>
                </TouchableOpacity>
            )}

            <View style={styles.statusRow}>
                <Ionicons
                    name={isConnected ? 'checkmark-circle' : 'close-circle'}
                    size={22}
                    color={isConnected ? '#4CAF50' : '#f44336'}
                />
                <Text style={[styles.status, { color: isConnected ? '#4CAF50' : '#f44336' }]}>
                    {isConnected ? 'Connecté' : 'Non connecté'}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
    icon: { alignSelf: 'center', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, padding: 12 },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 15, borderRadius: 10, marginTop: 10, gap: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
    status: { fontSize: 16, fontWeight: '500' }
})