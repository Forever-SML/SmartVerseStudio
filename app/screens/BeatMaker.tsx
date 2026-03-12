import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const pads = [
  {
    id: '1',
    emoji: '🥁',
    title: 'Kick',
    color: '#7B2FBE',
    sound: 'https://www.myinstants.com/media/sounds/kick.mp3',
  },
  {
    id: '2',
    emoji: '🪘',
    title: 'Snare',
    color: '#9D4EDD',
    sound: 'https://www.myinstants.com/media/sounds/snare.mp3',
  },
  {
    id: '3',
    emoji: '🎵',
    title: 'Hi Hat',
    color: '#6A0DAD',
    sound: 'https://www.myinstants.com/media/sounds/hihat.mp3',
  },
  {
    id: '4',
    emoji: '💥',
    title: 'Clap',
    color: '#5A0080',
    sound: 'https://www.myinstants.com/media/sounds/clap.mp3',
  },
  {
    id: '5',
    emoji: '🔊',
    title: 'Bass',
    color: '#7B2FBE',
    sound: 'https://www.myinstants.com/media/sounds/bass.mp3',
  },
  {
    id: '6',
    emoji: '🎶',
    title: 'Melody',
    color: '#9D4EDD',
    sound: 'https://www.myinstants.com/media/sounds/melody.mp3',
  },
  {
    id: '7',
    emoji: '⚡',
    title: 'FX',
    color: '#6A0DAD',
    sound: 'https://www.myinstants.com/media/sounds/fx.mp3',
  },
  {
    id: '8',
    emoji: '🌊',
    title: 'Synth',
    color: '#5A0080',
    sound: 'https://www.myinstants.com/media/sounds/synth.mp3',
  },
];

export default function BeatMakerScreen() {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tap the pads to create your beat');

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function handlePadPress(padId: string, soundUrl: string) {
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 150);
    try {
      const { sound: padSound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      padSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await padSound.unloadAsync();
        }
      });
    } catch (e) {
      setStatusMessage('Sound loading. Make sure you have internet.');
    }
  }

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setStatusMessage('Permission denied. Please allow microphone access.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatusMessage('Recording your beat...');
    } catch (err) {
      setStatusMessage('Could not start recording. Try again.');
    }
  }

  async function stopRecording() {
    try {
      setIsRecording(false);
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordingUri(uri);
        setRecording(null);
        setStatusMessage('Beat saved. Tap Play to listen.');
      }
    } catch (err) {
      setStatusMessage('Could not stop recording. Try again.');
    }
  }

  async function playRecording() {
    try {
      if (recordingUri) {
        setStatusMessage('Playing your beat...');
        const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
        setSound(sound);
        setIsPlaying(true);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setStatusMessage('Beat saved. Tap Play to listen.');
          }
        });
      }
    } catch (err) {
      setStatusMessage('Could not play beat. Try again.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥁 Beat Maker</Text>
        <Text style={styles.subtitle}>{statusMessage}</Text>
      </View>

      {/* BPM Control */}
      <View style={styles.bpmContainer}>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.max(60, bpm - 5))}>
          <Text style={styles.bpmButtonText}>－</Text>
        </TouchableOpacity>
        <View style={styles.bpmDisplay}>
          <Text style={styles.bpmNumber}>{bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.min(200, bpm + 5))}>
          <Text style={styles.bpmButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Drum Pads */}
      <View style={styles.padsGrid}>
        {pads.map(pad => (
          <TouchableOpacity
            key={pad.id}
            style={[
              styles.pad,
              { backgroundColor: pad.color },
              activePad === pad.id && styles.padActive,
            ]}
            onPress={() => handlePadPress(pad.id, pad.sound)}>
            <Text style={styles.padEmoji}>{pad.emoji}</Text>
            <Text style={styles.padTitle}>{pad.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Record Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isRecording && styles.controlButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.controlEmoji}>
            {isRecording ? '⏹️' : '⏺️'}
          </Text>
          <Text style={styles.controlText}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>

        {recordingUri && !isRecording && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={playRecording}>
            <Text style={styles.controlEmoji}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
            <Text style={styles.controlText}>
              {isPlaying ? 'Playing' : 'Play'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 55,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#9D4EDD',
    marginTop: 4,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  bpmButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  bpmButtonText: {
    fontSize: 24,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  bpmDisplay: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  bpmNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bpmLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    letterSpacing: 2,
  },
  padsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    flex: 1,
  },
  pad: {
    width: (width - 45) / 2,
    height: (width - 45) / 2 * 0.6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  padActive: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  padEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  padTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#1A0A2E',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  controlButtonActive: {
    backgroundColor: '#2E0A0A',
    borderColor: '#FF4444',
  },
  playButton: {
    flex: 1,
    backgroundColor: '#0A2E0A',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  controlEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});