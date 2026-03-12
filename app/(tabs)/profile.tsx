import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userAvatar, setUserAvatar] = useState('🎤');
  const [userLocation, setUserLocation] = useState('');
  const [userWebsite, setUserWebsite] = useState('');
  const [trackCount, setTrackCount] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: '1', emoji: '🎵', title: 'My Tracks', subtitle: 'All your recorded songs', route: '/screens/MyTracks' },
    { id: '2', emoji: '🎬', title: 'My Videos', subtitle: 'All your recorded videos', route: '' },
    { id: '3', emoji: '❤️', title: 'Liked Content', subtitle: 'Songs and videos you liked', route: '' },
    { id: '4', emoji: '🔔', title: 'Notifications', subtitle: 'Your alerts and updates', route: '' },
    { id: '5', emoji: '⚙️', title: 'Settings', subtitle: 'App preferences', route: '' },
    { id: '6', emoji: '🔒', title: 'Privacy', subtitle: 'Control your privacy', route: '' },
    { id: '7', emoji: '💜', title: 'Upgrade to Pro', subtitle: 'Unlock all features', route: '' },
    { id: '8', emoji: '❓', title: 'Help and Support', subtitle: 'Get help anytime', route: '' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || 'SmartVerse User');
            setUserBio(data.bio || '');
            setUserAvatar(data.avatar || '🎤');
            setUserLocation(data.location || '');
            setUserWebsite(data.website || '');
            setFollowers(data.followers || 0);
            setFollowing(data.following || 0);
          } else {
            setUserName('SmartVerse User');
          }
          const tracksSnapshot = await getDocs(
            collection(db, 'users', user.uid, 'tracks')
          );
          setTrackCount(tracksSnapshot.size);
        } catch (e) {
          setUserName('SmartVerse User');
        }
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (e) {
      console.log('Logout error:', e);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#C77DFF" size="large" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{userAvatar}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => router.push('/screens/EditProfile')}>
              <Text style={styles.editAvatarText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          {userBio ? (
            <Text style={styles.userBio}>{userBio}</Text>
          ) : null}
          {userLocation ? (
            <Text style={styles.userLocation}>📍 {userLocation}</Text>
          ) : null}
          {userWebsite ? (
            <Text style={styles.userWebsite}>🔗 {userWebsite}</Text>
          ) : null}

          {/* Follow and Edit Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/screens/EditProfile')}>
              <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>🔗 Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statEmoji}>🎵</Text>
            <Text style={styles.statCount}>{trackCount}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statCount}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statEmoji}>➕</Text>
            <Text style={styles.statCount}>{following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statEmoji}>🎬</Text>
            <Text style={styles.statCount}>0</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SmartVerse Studio v1.0.0</Text>

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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C77DFF',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  editAvatarText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 8,
    textAlign: 'center',
  },
  userBio: {
    fontSize: 13,
    color: '#C77DFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  userLocation: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  userWebsite: {
    fontSize: 12,
    color: '#9D4EDD',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  editProfileButton: {
    backgroundColor: '#1A0A2E',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  editProfileText: {
    fontSize: 13,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#1A0A2E',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  shareButtonText: {
    fontSize: 13,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#AAAAAA',
  },
  menuContainer: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  menuEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  menuArrow: {
    fontSize: 20,
    color: '#666666',
  },
  logoutButton: {
    backgroundColor: '#2E0A0A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
    marginBottom: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
});