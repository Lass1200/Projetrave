import { useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import * as FileSystem from 'expo-file-system/legacy'
import { Ionicons } from '@expo/vector-icons'

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

    // Récupère la liste des modèles disponibles depuis le serveur
    const fetchModels = async () => {
        try {
            const res = await fetch(`${serverUrl}/getmodels`)
            const data = await res.json()
            setModels(data.models)
        } catch {
            Alert.alert('Erreur', 'Impossible de récupérer les modèles')
        }
    }

    const selectModel = async (model: string) => {
        await fetch(`${serverUrl}/selectModel/${model}`)
        setSelectedModel(model)
    }

    // Envoie le clip au serveur et télécharge le résultat transformé
    const sendAndTransform = async () => {
        if (!selectedUri) return Alert.alert('Erreur', 'Sélectionne un clip')
        if (!isConnected) return Alert.alert('Erreur', 'Non connecté au serveur')
        setLoading(true)
        try {
            await FileSystem.uploadAsync(`${serverUrl}/upload`, selectedUri, {
                fieldName: 'file',
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            })
            const dest = FileSystem.documentDirectory + 'transformed.wav'
            await FileSystem.downloadAsync(`${serverUrl}/download`, dest)
            setTransformedUri(dest)
            Alert.alert('Transformation terminée !')
        } catch (e) {
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

            {/* Tabs sélection source audio */}
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

            {/* Contenu selon le tab actif */}
            {activeTab === 0 && (
                <Text style={{ textAlign: 'center', color: '#999', marginVertical: 10 }}>
                    Ajoute un fichier default.wav dans assets/
                </Text>
            )}
            {activeTab === 1 && (
                <FlatList
                    data={clips}
                    keyExtractor={item => item.id}
                    style={{ maxHeight: 150 }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#999' }}>Aucun clip enregistré</Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.clipItem, selectedUri === item.uri && styles.selectedClip]}
                            onPress={() => setSelectedUri(item.uri)}
                        >
                            <Ionicons name="musical-note-outline" size={18} color="#555" />
                            <Text style={{ flex: 1 }}>{item.name}</Text>
                            {selectedUri === item.uri && (
                                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
            {activeTab === 2 && (
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}
                    onPress={pickFromPhone}
                >
                    <Ionicons name="folder-open-outline" size={20} color="#000" />
                    <Text style={{ fontSize: 16 }}>Choisir un fichier</Text>
                </TouchableOpacity>
            )}

            {selectedUri && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 8 }}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={{ color: '#4CAF50' }}>Clip sélectionné</Text>
                </View>
            )}

            {/* Chargement et sélection des modèles */}
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}
                onPress={fetchModels}
            >
                <Ionicons name="cloud-download-outline" size={20} color="#000" />
                <Text style={{ fontSize: 16 }}>Charger les modèles</Text>
            </TouchableOpacity>

            <View style={styles.models}>
                {models.map(m => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.modelBtn, selectedModel === m && styles.selectedModel]}
                        onPress={() => selectModel(m)}
                    >
                        <Text style={{ color: selectedModel === m ? '#fff' : '#000' }}>
                            {m.replace('.onnx', '')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bouton envoi au serveur */}
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 10 }} />
            ) : (
                <TouchableOpacity style={styles.sendBtn} onPress={sendAndTransform}>
                    <Ionicons name="send-outline" size={20} color="white" />
                    <Text style={styles.sendBtnText}>Envoyer au serveur</Text>
                </TouchableOpacity>
            )}

            {/* Boutons lecture original et transformé */}
            <View style={styles.playButtons}>
                {selectedUri && (
                    <TouchableOpacity
                        style={{ alignItems: 'center', gap: 4 }}
                        onPress={() => playAudio(selectedUri)}
                    >
                        <Ionicons name="play-circle-outline" size={28} color="#000" />
                        <Text style={{ fontSize: 14 }}>Original</Text>
                    </TouchableOpacity>
                )}
                {transformedUri && (
                    <TouchableOpacity
                        style={{ alignItems: 'center', gap: 4 }}
                        onPress={() => playAudio(transformedUri)}
                    >
                        <Ionicons name="musical-notes-outline" size={28} color="#4CAF50" />
                        <Text style={{ fontSize: 14, color: '#4CAF50' }}>Transformé</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    tabs: { flexDirection: 'row', marginBottom: 15 },
    tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderColor: '#ccc' },
    activeTab: { borderColor: '#000' },
    tabText: { color: '#999' },
    activeTabText: { fontWeight: 'bold' },
    clipItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', gap: 10 },
    selectedClip: { backgroundColor: '#e0f0ff' },
    models: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
    modelBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
    selectedModel: { backgroundColor: '#000' },
    sendBtn: { flexDirection: 'row', backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
    sendBtnText: { color: 'white', fontWeight: 'bold' },
    playButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
})