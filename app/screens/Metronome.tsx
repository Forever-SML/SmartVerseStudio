import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MetronomeScreen() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  async function playClick(isFirstBeat: boolean) {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: isFirstBeat
          ? 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'
          : 'https://www.soundjay.com/button/sounds/button-09.mp3'
        },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (e) {
      // silent fail
    }
  }

  function startMetronome() {
    setIsPlaying(true);
    beatRef.current = 0;
    setBeat(0);
    const interval = (60 / bpm) * 1000;
    playClick(true);
    intervalRef.current = setInterval(() => {
      beatRef.current = (beatRef.current + 1) % beatsPerBar;
      setBeat(beatRef.current);
      playClick(beatRef.current === 0);
    }, interval);
  }

  function stopMetronome() {
    setIsPlaying(false);
    setBeat(0);
    beatRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handlePlayStop() {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }

  function changeBpm(amount: number) {
    if (isPlaying) {
      stopMetronome();
    }
    setBpm(prev => Math.min(200, Math.max(40, prev + amount)));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📻 Metronome</Text>
        <Text style={styles.subtitle}>Keep your rhythm perfectly</Text>
      </View>

      {/* Beat Indicators */}
      <View style={styles.beatsRow}>
        {Array.from({ length: beatsPerBar }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.beatIndicator,
              isPlaying && beat === index && styles.beatIndicatorActive,
              index === 0 && styles.beatIndicatorFirst,
            ]}>
            <Text style={styles.beatNumber}>{index + 1}</Text>
          </View>
        ))}
      </View>

      {/* BPM Display */}
      <View style={styles.bpmSection}>
        <Text style={styles.bpmNumber}>{bpm}</Text>
        <Text style={styles.bpmLabel}>BPM</Text>
      </View>

      {/* BPM Controls */}
      <View style={styles.bpmControls}>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => changeBpm(-10)}>
          <Text style={styles.bpmButtonText}>-10</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => changeBpm(-1)}>
          <Text style={styles.bpmButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => changeBpm(1)}>
          <Text style={styles.bpmButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => changeBpm(10)}>
          <Text style={styles.bpmButtonText}>+10</Text>
        </TouchableOpacity>
      </View>

      {/* Tempo Labels */}
      <View style={styles.tempoLabels}>
        <TouchableOpacity
          style={styles.tempoLabel}
          onPress={() => { stopMetronome(); setBpm(60); }}>
          <Text style={styles.tempoLabelText}>Slow</Text>
          <Text style={styles.tempoLabelBpm}>60</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tempoLabel}
          onPress={() => { stopMetronome(); setBpm(90); }}>
          <Text style={styles.tempoLabelText}>Moderate</Text>
          <Text style={styles.tempoLabelBpm}>90</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tempoLabel}
          onPress={() => { stopMetronome(); setBpm(120); }}>
          <Text style={styles.tempoLabelText}>Normal</Text>
          <Text style={styles.tempoLabelBpm}>120</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tempoLabel}
          onPress={() => { stopMetronome(); setBpm(160); }}>
          <Text style={styles.tempoLabelText}>Fast</Text>
          <Text style={styles.tempoLabelBpm}>160</Text>
        </TouchableOpacity>
      </View>

      {/* Beats Per Bar */}
      <Text style={styles.sectionTitle}>Beats Per Bar</Text>
      <View style={styles.beatsPerBarRow}>
        {[2, 3, 4, 6].map(num => (
          <TouchableOpacity
            key={num}
            style={[
              styles.beatsPerBarButton,
              beatsPerBar === num && styles.beatsPerBarButtonActive,
            ]}
            onPress={() => { stopMetronome(); setBeatsPerBar(num); }}>
            <Text style={[
              styles.beatsPerBarText,
              beatsPerBar === num && styles.beatsPerBarTextActive,
            ]}>
              {num}/4
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Play Stop Button */}
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={handlePlayStop}>
        <Text style={styles.playEmoji}>{isPlaying ? '⏹️' : '▶️'}</Text>
        <Text style={styles.playText}>
          {isPlaying ? 'Stop Metronome' : 'Start Metronome'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginBottom: 30,
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
  beatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  beatIndicator: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  beatIndicatorActive: {
    backgroundColor: '#7B2FBE',
    borderColor: '#C77DFF',
  },
  beatIndicatorFirst: {
    borderColor: '#C77DFF',
  },
  beatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bpmSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bpmNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  bpmLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    letterSpacing: 4,
  },
  bpmControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  bpmButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  bpmButtonText: {
    fontSize: 16,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  tempoLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  tempoLabel: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
    flex: 1,
    marginHorizontal: 3,
  },
  tempoLabelText: {
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 3,
  },
  tempoLabelBpm: {
    fontSize: 14,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 12,
    letterSpacing: 1,
  },
  beatsPerBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  beatsPerBarButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  beatsPerBarButtonActive: {
    backgroundColor: '#1A0A2E',
    borderColor: '#C77DFF',
  },
  beatsPerBarText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: 'bold',
  },
  beatsPerBarTextActive: {
    color: '#C77DFF',
  },
  playButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
    gap: 10,
  },
  playButtonActive: {
    backgroundColor: '#2E0A0A',
    borderColor: '#FF4444',
  },
  playEmoji: {
    fontSize: 24,
  },
  playText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});