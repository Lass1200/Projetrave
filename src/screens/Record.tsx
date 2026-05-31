import { useEffect, useRef, useState } from 'react'
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { useDispatch, useSelector } from 'react-redux'
import { addClip, deleteClip } from '../store/clipsSlice'
import { AppDispatch, RootState } from '../store/store'
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
            Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement')
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
            const dest = FileSystem.documentDirectory + `${uuidv4()}.m4a`
            await FileSystem.copyAsync({ from: recordedUri, to: dest })
            dispatch(addClip({ id: uuidv4(), name: clipName, uri: dest }))
            setClipName('')
            setRecordedUri(null)
            setSound(null)
            Alert.alert('Clip sauvegardé !')
        } catch (e) {
            console.log('erreur:', e)
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

            <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recording]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Text style={styles.recordText}>{isRecording ? ' Stop' : ' Enregistrer'}</Text>
            </TouchableOpacity>

            {recordedUri && (
                <View style={styles.preview}>
                    <Button title={isPlaying ? ' Pause' : ' Écouter'} onPress={playPause} />
                    <TextInput
                        style={styles.input}
                        placeholder="Nom du clip"
                        value={clipName}
                        onChangeText={setClipName}
                    />
                    <Button title="Sauvegarder" onPress={saveClip} />
                </View>
            )}

            <Text style={styles.subtitle}>Mes enregistrements</Text>
            <FlatList
                data={clips}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.clipItem}>
                        <Text style={styles.clipName}>{item.name}</Text>
                        <Button title="play" onPress={() => playClip(item.uri)} />
                        <Button title="supprimer" onPress={() => dispatch(deleteClip(item.id))} />
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    recordBtn: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 50, alignItems: 'center', marginBottom: 20 },
    recording: { backgroundColor: '#f44336' },
    recordText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    preview: { gap: 10, marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
    clipItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    clipName: { flex: 1, fontSize: 16 }
})