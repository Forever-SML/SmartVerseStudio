import { Audio } from 'expo-av';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function MyTracksScreen() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [userId, setUserId] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Tracks' },
    { id: 'recent', label: 'Recent' },
    { id: 'favourites', label: 'Favourites' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadTracks(user.uid);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  async function loadTracks(uid: string) {
    try {
      const q = query(
        collection(db, 'users', uid, 'tracks'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        favourite: doc.data().favourite || false,
      }));
      setTracks(trackList);
    } catch (e) {
      console.log('Error loading tracks:', e);
    }
  }

  async function playTrack(track: any) {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlayingId(null);
      }
      if (playingId === track.id) return;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingId(track.id);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (e) {
      console.log('Error playing track:', e);
    }
  }

  async function toggleFavourite(track: any) {
    try {
      await updateDoc(doc(db, 'users', userId, 'tracks', track.id), {
        favourite: !track.favourite,
      });
      setTracks(prev => prev.map(t =>
        t.id === track.id ? { ...t, favourite: !t.favourite } : t
      ));
    } catch (e) {
      console.log('Error updating favourite:', e);
    }
  }

  async function deleteTrack(track: any) {
    Alert.alert(
      'Delete Track',
      `Are you sure you want to delete ${track.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId, 'tracks', track.id));
              setTracks(prev => prev.filter(t => t.id !== track.id));
            } catch (e) {
              console.log('Error deleting track:', e);
            }
          },
        },
      ]
    );
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getFilteredTracks() {
    if (selectedTab === 'favourites') {
      return tracks.filter(t => t.favourite);
    }
    if (selectedTab === 'recent') {
      return tracks.slice(0, 5);
    }
    return tracks;
  }

  const filteredTracks = getFilteredTracks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 My Tracks</Text>
        <Text style={styles.subtitle}>
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} recorded
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab.id)}>
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tracks.length}</Text>
            <Text style={styles.statLabel}>Total Tracks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {tracks.filter(t => t.favourite).length}
            </Text>
            <Text style={styles.statLabel}>Favourites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {formatTime(tracks.reduce((acc, t) => acc + (t.duration || 0), 0))}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        {/* Tracks List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#C77DFF" size="large" />
            <Text style={styles.loadingText}>Loading your tracks...</Text>
          </View>
        ) : filteredTracks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'favourites'
                ? 'No favourite tracks yet'
                : 'No tracks yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'favourites'
                ? 'Tap the heart on any track to add it here'
                : 'Go to Studio and record your first track'}
            </Text>
          </View>
        ) : (
          filteredTracks.map(track => (
            <View key={track.id} style={styles.trackCard}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playTrack(track)}>
                <View style={[
                  styles.playCircle,
                  playingId === track.id && styles.playCircleActive,
                ]}>
                  <Text style={styles.playEmoji}>
                    {playingId === track.id ? '⏸️' : '▶️'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.trackMeta}>
                  {formatTime(track.duration || 0)} • {formatDate(track.createdAt)}
                </Text>
                {playingId === track.id && (
                  <Text style={styles.nowPlaying}>▶ Now Playing...</Text>
                )}
              </View>

              <View style={styles.trackActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleFavourite(track)}>
                  <Text style={styles.actionEmoji}>
                    {track.favourite ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteTrack(track)}>
                  <Text style={styles.actionEmoji}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#7B2FBE',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 15,
  },
  loadingText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  playButton: {
    marginRight: 12,
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A0A2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  playCircleActive: {
    backgroundColor: '#7B2FBE',
    borderColor: '#C77DFF',
  },
  playEmoji: {
    fontSize: 20,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackMeta: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  nowPlaying: {
    fontSize: 11,
    color: '#C77DFF',
    marginTop: 3,
  },
  trackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionEmoji: {
    fontSize: 16,
  },
});