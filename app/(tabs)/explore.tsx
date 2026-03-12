import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, increment, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('people');

  const tabs = [
    { id: 'people', label: '👥 People' },
    { id: 'tracks', label: '🎵 Tracks' },
    { id: 'trending', label: '🔥 Trending' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        await loadUsers(user.uid);
        await loadFollowing(user.uid);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function loadUsers(currentUid: string) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUid);
      setUsers(userList);
    } catch (e) {
      console.log('Error loading users:', e);
    }
  }

  async function loadFollowing(currentUid: string) {
    try {
      const snapshot = await getDocs(
        collection(db, 'users', currentUid, 'following')
      );
      const ids = snapshot.docs.map(doc => doc.id);
      setFollowingIds(ids);
    } catch (e) {
      console.log('Error loading following:', e);
    }
  }

  async function toggleFollow(targetUser: any) {
    if (!currentUserId) return;
    const isFollowing = followingIds.includes(targetUser.id);

    try {
      if (isFollowing) {
        await deleteDoc(
          doc(db, 'users', currentUserId, 'following', targetUser.id)
        );
        await deleteDoc(
          doc(db, 'users', targetUser.id, 'followers', currentUserId)
        );
        await updateDoc(doc(db, 'users', currentUserId), {
          following: increment(-1),
        });
        await updateDoc(doc(db, 'users', targetUser.id), {
          followers: increment(-1),
        });
        setFollowingIds(prev => prev.filter(id => id !== targetUser.id));
        setUsers(prev => prev.map(u =>
          u.id === targetUser.id
            ? { ...u, followers: (u.followers || 1) - 1 }
            : u
        ));
      } else {
        await setDoc(
          doc(db, 'users', currentUserId, 'following', targetUser.id),
          { followedAt: new Date().toISOString() }
        );
        await setDoc(
          doc(db, 'users', targetUser.id, 'followers', currentUserId),
          { followedAt: new Date().toISOString() }
        );
        await updateDoc(doc(db, 'users', currentUserId), {
          following: increment(1),
        });
        await updateDoc(doc(db, 'users', targetUser.id), {
          followers: increment(1),
        });
        setFollowingIds(prev => [...prev, targetUser.id]);
        setUsers(prev => prev.map(u =>
          u.id === targetUser.id
            ? { ...u, followers: (u.followers || 0) + 1 }
            : u
        ));
      }
    } catch (e) {
      console.log('Error toggling follow:', e);
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Explore</Text>
        <Text style={styles.subtitle}>Discover amazing creators</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators..."
            placeholderTextColor="#666666"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

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

        {/* People Tab */}
        {selectedTab === 'people' && (
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#C77DFF" size="large" />
                <Text style={styles.loadingText}>Finding creators...</Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>No creators found</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to invite your friends to SmartVerse
                </Text>
              </View>
            ) : (
              filteredUsers.map(user => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userLeft}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarEmoji}>
                        {user.avatar || '🎤'}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name || 'SmartVerse User'}</Text>
                      {user.bio ? (
                        <Text style={styles.userBio} numberOfLines={1}>
                          {user.bio}
                        </Text>
                      ) : null}
                      {user.location ? (
                        <Text style={styles.userLocation}>
                          📍 {user.location}
                        </Text>
                      ) : null}
                      <Text style={styles.userFollowers}>
                        👥 {user.followers || 0} followers
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      followingIds.includes(user.id) && styles.followingButton,
                    ]}
                    onPress={() => toggleFollow(user)}>
                    <Text style={[
                      styles.followButtonText,
                      followingIds.includes(user.id) && styles.followingButtonText,
                    ]}>
                      {followingIds.includes(user.id) ? '✓ Following' : '+ Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* Tracks Tab */}
        {selectedTab === 'tracks' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyText}>Tracks Coming Soon</Text>
            <Text style={styles.emptySubtext}>
              Public tracks from all creators will appear here
            </Text>
          </View>
        )}

        {/* Trending Tab */}
        {selectedTab === 'trending' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔥</Text>
            <Text style={styles.emptyText}>Trending Coming Soon</Text>
            <Text style={styles.emptySubtext}>
              The hottest content on SmartVerse will appear here
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 55,
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
    paddingBottom: 120,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#FFFFFF',
    fontSize: 14,
  },
  clearSearch: {
    fontSize: 16,
    color: '#666666',
    padding: 5,
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    justifyContent: 'space-between',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#C77DFF',
  },
  userAvatarEmoji: {
    fontSize: 26,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  userBio: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 11,
    color: '#9D4EDD',
    marginBottom: 2,
  },
  userFollowers: {
    fontSize: 11,
    color: '#666666',
  },
  followButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#C77DFF',
    marginLeft: 10,
  },
  followingButton: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#AAAAAA',
  },
});