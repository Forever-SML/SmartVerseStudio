import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

const quickActions = [
  { id: '1', emoji: '🎤', title: 'Record', subtitle: 'Record your voice', route: '/(tabs)/studio' },
  { id: '2', emoji: '🥁', title: 'Beat Maker', subtitle: 'Make beats', route: '/screens/BeatMaker' },
  { id: '3', emoji: '🎥', title: 'Video', subtitle: 'Record video', route: '/screens/RecordVideo' },
  { id: '4', emoji: '📸', title: 'Camera', subtitle: 'Take photos', route: '/screens/AICamera' },
];

const features = [
  { id: '1', emoji: '🎵', title: 'Record Music', description: 'Record your voice and create amazing tracks with professional quality', color: '#1A0A2E', border: '#7B2FBE' },
  { id: '2', emoji: '🥁', title: 'Beat Maker', description: 'Create professional beats with drums, bass and more instruments', color: '#0A1A2E', border: '#1A6BBE' },
  { id: '3', emoji: '🎬', title: 'Record Videos', description: 'Record cinematic videos and reels to share with the world', color: '#1A0A0A', border: '#BE1A1A' },
  { id: '4', emoji: '🤝', title: 'Collaborate', description: 'Work with other creators around the world to make music together', color: '#0A1A0A', border: '#1ABE1A' },
  { id: '5', emoji: '🔴', title: 'Go Live', description: 'Stream live to your fans and grow your audience in real time', color: '#2E0A0A', border: '#FF4444' },
  { id: '6', emoji: '🤖', title: 'AI Features', description: 'Use AI to enhance your voice, add instruments and create harmony', color: '#1A1A0A', border: '#BEB81A' },
];

const howToUse = [
  { id: '1', step: '1', emoji: '📱', title: 'Create Account', description: 'Sign up with your email to get started for free' },
  { id: '2', step: '2', emoji: '🎤', title: 'Go To Studio', description: 'Tap Studio at the bottom then press Start Recording' },
  { id: '3', step: '3', emoji: '🥁', title: 'Add A Beat', description: 'Go to Beat Maker and create a beat to go with your voice' },
  { id: '4', step: '4', emoji: '🎚️', title: 'Mix Your Track', description: 'Use the Mixer to balance your voice and beat perfectly' },
  { id: '5', step: '5', emoji: '🎬', title: 'Record Video', description: 'Go to Create and record a video to show your performance' },
  { id: '6', step: '6', emoji: '🌍', title: 'Share With World', description: 'Share your music and videos with creators around the world' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('🎤');
  const [trackCount, setTrackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || 'Creator');
            setUserAvatar(data.avatar || '🎤');
          }
          const tracksSnapshot = await getDocs(
            collection(db, 'users', user.uid, 'tracks')
          );
          setTrackCount(tracksSnapshot.size);
        } catch (e) {
          console.log('Error loading home data:', e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🎵</Text>
        <ActivityIndicator color="#C77DFF" size="large" />
        <Text style={styles.loadingText}>Loading SmartVerse...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>
            {userName ? userName : 'Welcome'} 👋
          </Text>
          <Text style={styles.tagline}>Your AI Music and Video Platform</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{userAvatar}</Text>
          </View>
          {trackCount > 0 && (
            <View style={styles.trackBadge}>
              <Text style={styles.trackBadgeText}>{trackCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeEmoji}>🎵</Text>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome to SmartVerse Studio</Text>
            <Text style={styles.welcomeSubtitle}>
              Record music. Make beats. Create videos. Share with the world.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        {trackCount > 0 && (
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push('/screens/MyTracks')}>
              <Text style={styles.statEmoji}>🎵</Text>
              <Text style={styles.statNumber}>{trackCount}</Text>
              <Text style={styles.statLabel}>Your Tracks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/studio')}>
              <Text style={styles.statEmoji}>🎤</Text>
              <Text style={styles.statNumber}>+</Text>
              <Text style={styles.statLabel}>Record New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.statEmoji}>🌍</Text>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Explore</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickCard}
              onPress={() => router.push(action.route as any)}>
              <Text style={styles.quickEmoji}>{action.emoji}</Text>
              <Text style={styles.quickTitle}>{action.title}</Text>
              <Text style={styles.quickSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* How To Use */}
        <Text style={styles.sectionTitle}>How To Use SmartVerse</Text>
        <View style={styles.howToContainer}>
          {howToUse.map(item => (
            <View key={item.id} style={styles.howToCard}>
              <View style={styles.howToStep}>
                <Text style={styles.howToStepNumber}>{item.step}</Text>
              </View>
              <Text style={styles.howToEmoji}>{item.emoji}</Text>
              <View style={styles.howToInfo}>
                <Text style={styles.howToTitle}>{item.title}</Text>
                <Text style={styles.howToDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Everything You Can Do</Text>
        <View style={styles.featuresGrid}>
          {features.map(feature => (
            <View
              key={feature.id}
              style={[
                styles.featureCard,
                { backgroundColor: feature.color, borderColor: feature.border },
              ]}>
              <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>

        {/* Start Now Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/(tabs)/studio')}>
          <Text style={styles.startEmoji}>🚀</Text>
          <Text style={styles.startText}>Start Creating Now</Text>
          <Text style={styles.startSubtext}>Go to Studio and record your first track</Text>
        </TouchableOpacity>

        {/* Invite Friends */}
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.inviteEmoji}>👥</Text>
          <Text style={styles.inviteText}>Find and Follow Creators</Text>
          <Text style={styles.inviteSubtext}>Discover amazing talent on SmartVerse</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  loadingEmoji: {
    fontSize: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 12,
    color: '#9D4EDD',
    marginTop: 2,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C77DFF',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  trackBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 120,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A0A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#7B2FBE',
    gap: 15,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#C77DFF',
    lineHeight: 18,
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
    borderColor: '#7B2FBE',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quickCard: {
    width: (width - 55) / 4,
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  quickEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  quickSubtitle: {
    fontSize: 9,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  howToContainer: {
    marginBottom: 25,
    gap: 10,
  },
  howToCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    gap: 12,
  },
  howToStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToStepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  howToEmoji: {
    fontSize: 26,
  },
  howToInfo: {
    flex: 1,
  },
  howToTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  howToDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  featureCard: {
    width: (width - 45) / 2,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  featureEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  startButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  startEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  startText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  startSubtext: {
    fontSize: 12,
    color: '#E0AAFF',
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#1A0A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  inviteEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  inviteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 4,
  },
  inviteSubtext: {
    fontSize: 12,
    color: '#9D4EDD',
    textAlign: 'center',
  },
});