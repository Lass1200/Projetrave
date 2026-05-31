import { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { useDispatch, useSelector } from 'react-redux'
import { addClip, deleteClip } from '../store/clipsSlice'
import { AppDispatch, RootState } from '../store/store'
import { Ionicons } from '@expo/vector-icons'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

export default function Record() {
    const dispatch = useDispatch<AppDispatch>()
    const clips = useSelector((state: RootState) => state.clips.clips)

    const [recording, setRecording] = useState<Audio.Recording | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedUri, setRecordedUri] = useState<string | null>(null)
    const [sound, setSound] = useState<Audio.Sound | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [clipName, setClipName] = useState('')

    // Demande la permission micro au montage du composant
    useEffect(() => {
        Audio.requestPermissionsAsync()
    }, [])

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )
            setRecording(recording)
            setIsRecording(true)
        } catch (e) {
            Alert.alert('Erreur', "Impossible de démarrer l'enregistrement")
        }
    }

    const stopRecording = async () => {
        if (!recording) return
        await recording.stopAndUnloadAsync()
        const uri = recording.getURI()
        setRecordedUri(uri)
        setRecording(null)
        setIsRecording(false)
    }

    const playPause = async () => {
        if (!recordedUri) return
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync()
                setIsPlaying(false)
            } else {
                await sound.playAsync()
                setIsPlaying(true)
            }
        } else {
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedUri })
            setSound(newSound)
            await newSound.playAsync()
            setIsPlaying(true)
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) setIsPlaying(false)
            })
        }
    }

    const saveClip = async () => {
        if (!recordedUri || !clipName.trim()) {
            Alert.alert('Erreur', 'Enregistre un clip et donne lui un nom')
            return
        }
        try {
            // Copie le fichier du cache vers le stockage persistant
            const dest = FileSystem.documentDirectory + `${uuidv4()}.m4a`
            await FileSystem.copyAsync({ from: recordedUri, to: dest })
            dispatch(addClip({ id: uuidv4(), name: clipName, uri: dest }))
            setClipName('')
            setRecordedUri(null)
            setSound(null)
            Alert.alert('Clip sauvegardé !')
        } catch (e) {
            Alert.alert('Erreur', String(e))
        }
    }

    const playClip = async (uri: string) => {
        const { sound } = await Audio.Sound.createAsync({ uri })
        await sound.playAsync()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enregistrement</Text>

            {/* Bouton enregistrer / stop */}
            <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recording]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="white" />
                <Text style={styles.recordText}>{isRecording ? 'Stop' : 'Enregistrer'}</Text>
            </TouchableOpacity>

            {/* Section preview — visible seulement après un enregistrement */}
            {recordedUri && (
                <View style={styles.preview}>
                    <TouchableOpacity style={styles.playBtn} onPress={playPause}>
                        <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#000" />
                        <Text style={styles.playText}>{isPlaying ? 'Pause' : 'Écouter'}</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom du clip"
                        value={clipName}
                        onChangeText={setClipName}
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={saveClip}>
                        <Ionicons name="save-outline" size={20} color="white" />
                        <Text style={styles.saveBtnText}>Sauvegarder</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.subtitle}>Mes enregistrements</Text>

            {/* Liste des clips sauvegardés depuis Redux */}
            <FlatList
                data={clips}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                    <Text style={styles.empty}>Aucun enregistrement pour l'instant</Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.clipItem}>
                        <Ionicons name="musical-note-outline" size={20} color="#555" />
                        <Text style={styles.clipName}>{item.name}</Text>
                        <TouchableOpacity onPress={() => playClip(item.uri)} style={styles.clipBtn}>
                            <Ionicons name="play-circle-outline" size={26} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => dispatch(deleteClip(item.id))} style={styles.clipBtn}>
                            <Ionicons name="trash-outline" size={26} color="#f44336" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    recordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 20, borderRadius: 50, marginBottom: 20, gap: 10 },
    recording: { backgroundColor: '#f44336' },
    recordText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    preview: { gap: 10, marginBottom: 20 },
    playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, gap: 8 },})