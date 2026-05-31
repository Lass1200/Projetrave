import { useState } from 'react'
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import * as FileSystem from 'expo-file-system/legacy'

const TABS = ['Défaut', 'Mes clips', 'Téléphone']

export default function RAVE() {
    const { ip, port, isConnected } = useSelector((state: RootState) => state.server)
    const clips = useSelector((state: RootState) => state.clips.clips)

    const [activeTab, setActiveTab] = useState(0)
    const [selectedUri, setSelectedUri] = useState<string | null>(null)
    const [transformedUri, setTransformedUri] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [models, setModels] = useState<string[]>([])
    const [selectedModel, setSelectedModel] = useState<string | null>(null)

    const serverUrl = `http://${ip}:${port}`

    const pickFromPhone = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' })
        if (!result.canceled) setSelectedUri(result.assets[0].uri)
    }

    const fetchModels = async () => {
        try {
            const res = await fetch(`${serverUrl}/getmodels`)
            const data = await res.json()
            setModels(data.models)  // ← .models ici
        } catch {
            Alert.alert('Erreur', 'Impossible de récupérer les modèles')
        }
    }

    const selectModel = async (model: string) => {
        await fetch(`${serverUrl}/selectModel/${model}`)
        setSelectedModel(model)
    }

    const sendAndTransform = async () => {
        if (!selectedUri) return Alert.alert('Erreur', 'Sélectionne un clip')
        if (!isConnected) return Alert.alert('Erreur', 'Non connecté au serveur')
        setLoading(true)
        try {
            const uploadRes = await FileSystem.uploadAsync(`${serverUrl}/upload`, selectedUri, {
                fieldName: 'file',
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            })
            console.log('upload result:', uploadRes.status, uploadRes.body)

            const dest = FileSystem.documentDirectory + 'transformed.wav'
            const dlRes = await FileSystem.downloadAsync(`${serverUrl}/download`, dest)
            console.log('download result:', dlRes.status)

            setTransformedUri(dest)
            Alert.alert('Transformation terminée !')
        } catch (e) {
            console.log('erreur détaillée:', e)
            Alert.alert('Erreur', String(e))
        } finally {
            setLoading(false)
        }
    }
    const playAudio = async (uri: string) => {
        const { sound } = await Audio.Sound.createAsync({ uri })
        await sound.playAsync()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>RAVE</Text>

            {/* Tabs */}
            <View style={styles.tabs}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === i && styles.activeTab]}
                        onPress={() => setActiveTab(i)}
                    >
                        <Text style={activeTab === i ? styles.activeTabText : styles.tabText}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Contenu tab */}
            {activeTab === 0 && (
                <Text style={{ textAlign: 'center', color: '#999' }}>
                    Ajoute un fichier audio.wav dans le dossier assets/ et nomme le "default.wav"
                </Text>
            )}
            {activeTab === 1 && (
                <FlatList
                    data={clips}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.clipItem, selectedUri === item.uri && styles.selected]}
                            onPress={() => setSelectedUri(item.uri)}
                        >
                            <Text>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
            {activeTab === 2 && (
                <Button title="Choisir un fichier" onPress={pickFromPhone} />
            )}

            {selectedUri && <Text style={styles.selected_text}> Clip sélectionné</Text>}

            {/* Modèles */}
            <Button title="Charger les modèles" onPress={fetchModels} />
            <View style={styles.models}>
                {models.map(m => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.modelBtn, selectedModel === m && styles.selectedModel]}
                        onPress={() => selectModel(m)}
                    >
                        <Text>{m}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Envoyer */}
            {loading
                ? <ActivityIndicator size="large" />
                : <Button title=" Envoyer au serveur" onPress={sendAndTransform} />
            }

            {/* Lecture */}
            <View style={styles.playButtons}>
                {selectedUri && (
                    <Button title="▶ Original" onPress={() => playAudio(selectedUri)} />
                )}
                {transformedUri && (
                    <Button title="🎵 Transformé" onPress={() => playAudio(transformedUri)} />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    tabs: { flexDirection: 'row', marginBottom: 20 },
    tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderColor: '#ccc' },
    activeTab: { borderColor: '#000' },
    tabText: { color: '#999' },
    activeTabText: { fontWeight: 'bold', color: '#000' },
    clipItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    selected: { backgroundColor: '#e0f0ff' },
    selected_text: { textAlign: 'center', marginVertical: 10, color: 'green' },
    models: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 15 },
    modelBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
    selectedModel: { backgroundColor: '#000', borderColor: '#000' },
    playButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }
})