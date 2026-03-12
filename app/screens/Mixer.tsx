import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tracks = [
  { id: '1', emoji: '🎤', title: 'Vocals', color: '#7B2FBE' },
  { id: '2', emoji: '🥁', title: 'Drums', color: '#9D4EDD' },
  { id: '3', emoji: '🎸', title: 'Bass', color: '#6A0DAD' },
  { id: '4', emoji: '🎹', title: 'Melody', color: '#5A0080' },
  { id: '5', emoji: '🎵', title: 'Music', color: '#7B2FBE' },
  { id: '6', emoji: '✨', title: 'Effects', color: '#9D4EDD' },
];

function VolumeSlider({ value, onChange, color }: {
  value: number;
  onChange: (val: number) => void;
  color: string;
}) {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return (
    <View style={sliderStyles.container}>
      {steps.reverse().map(step => (
        <TouchableOpacity
          key={step}
          style={[
            sliderStyles.step,
            { backgroundColor: value >= step ? color : '#1A1A1A' },
          ]}
          onPress={() => onChange(step)}
        />
      ))}
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 3,
  },
  step: {
    width: 30,
    height: 8,
    borderRadius: 4,
  },
});

export default function MixerScreen() {
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    '1': 80,
    '2': 70,
    '3': 60,
    '4': 75,
    '5': 65,
    '6': 50,
  });
  const [muted, setMuted] = useState<{ [key: string]: boolean }>({});
  const [soloed, setSoloed] = useState<{ [key: string]: boolean }>({});

  function updateVolume(id: string, value: number) {
    setVolumes(prev => ({ ...prev, [id]: value }));
  }

  function toggleMute(id: string) {
    setMuted(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSolo(id: string) {
    setSoloed(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎚️ Mixer</Text>
        <Text style={styles.subtitle}>Balance your tracks perfectly</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mixerContent}>

        {tracks.map(track => (
          <View key={track.id} style={styles.channel}>

            {/* Track Name */}
            <Text style={styles.channelEmoji}>{track.emoji}</Text>
            <Text style={styles.channelName}>{track.title}</Text>

            {/* Volume Number */}
            <Text style={styles.volumeNumber}>{volumes[track.id]}%</Text>

            {/* Volume Slider */}
            <VolumeSlider
              value={volumes[track.id]}
              onChange={(val) => updateVolume(track.id, val)}
              color={track.color}
            />

            {/* Solo Button */}
            <TouchableOpacity
              style={[
                styles.soloButton,
                soloed[track.id] && styles.soloButtonActive,
              ]}
              onPress={() => toggleSolo(track.id)}>
              <Text style={styles.soloText}>S</Text>
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.muteButton,
                muted[track.id] && styles.muteButtonActive,
              ]}
              onPress={() => toggleMute(track.id)}>
              <Text style={styles.muteText}>M</Text>
            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>

      {/* Master Volume */}
      <View style={styles.masterSection}>
        <Text style={styles.masterTitle}>🎛️ Master Volume</Text>
        <View style={styles.masterControls}>
          <TouchableOpacity style={styles.masterButton}>
            <Text style={styles.masterButtonText}>▶️ Play Mix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.masterButton}>
            <Text style={styles.masterButtonText}>💾 Save Mix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.masterButton}>
            <Text style={styles.masterButtonText}>📤 Export</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
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
  mixerContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    gap: 10,
  },
  channel: {
    width: 70,
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  channelEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  channelName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  volumeNumber: {
    fontSize: 11,
    color: '#C77DFF',
    marginBottom: 8,
  },
  soloButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  soloButtonActive: {
    backgroundColor: '#FFD700',
  },
  soloText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  muteButtonActive: {
    backgroundColor: '#FF4444',
  },
  muteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4444',
  },
  masterSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  masterControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  masterButton: {
    flex: 1,
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  masterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});