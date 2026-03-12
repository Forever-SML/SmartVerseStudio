import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

const avatarEmojis = [
  '🎤', '🎵', '🎸', '🥁', '🎹', '🎺',
  '🎻', '🎬', '🌟', '👑', '🔥', '💜',
  '🦁', '🐯', '🦊', '🐺', '🦅', '🦋',
  '🌍', '🌙', '⚡', '🎯', '💎', '🚀',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎤');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || '');
            setBio(data.bio || '');
            setLocation(data.location || '');
            setWebsite(data.website || '');
            setSelectedEmoji(data.avatar || '🎤');
          }
        } catch (e) {
          console.log('Error loading profile:', e);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function saveProfile() {
    if (!name.trim()) {
      setIsError(true);
      setStatusMessage('Please enter your name.');
      return;
    }
    setSaving(true);
    setStatusMessage('');
    try {
      await setDoc(doc(db, 'users', userId), {
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar: selectedEmoji,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setIsError(false);
      setStatusMessage('✅ Profile saved successfully!');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (e) {
      console.log('Save error:', e);
      setIsError(true);
      setStatusMessage('Could not save profile. Try again.');
    } finally {
      setSaving(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Avatar Preview */}
        <View style={styles.selectedAvatar}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{selectedEmoji}</Text>
          </View>
          <Text style={styles.avatarLabel}>Tap any emoji below to change</Text>
        </View>

        {/* Avatar Grid */}
        <Text style={styles.sectionTitle}>Choose Your Avatar</Text>
        <View style={styles.emojiGrid}>
          {avatarEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiButton,
                selectedEmoji === emoji && styles.emojiButtonActive,
              ]}
              onPress={() => setSelectedEmoji(emoji)}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name Input */}
        <Text style={styles.sectionTitle}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#666666"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Bio Input */}
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell the world about yourself..."
          placeholderTextColor="#666666"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={150}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{bio.length}/150</Text>

        {/* Location Input */}
        <Text style={styles.sectionTitle}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Where are you from? e.g. Nairobi, Kenya"
          placeholderTextColor="#666666"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="words"
        />

        {/* Website Input */}
        <Text style={styles.sectionTitle}>Website or Social Link</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. instagram.com/yourname"
          placeholderTextColor="#666666"
          value={website}
          onChangeText={setWebsite}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Status Message */}
        {statusMessage ? (
          <Text style={[
            styles.statusMessage,
            isError ? styles.statusError : styles.statusSuccess,
          ]}>
            {statusMessage}
          </Text>
        ) : null}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Save Profile</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 12,
    letterSpacing: 1,
  },
  selectedAvatar: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C77DFF',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
    gap: 10,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  emojiButtonActive: {
    backgroundColor: '#1A0A2E',
    borderColor: '#C77DFF',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  bioInput: {
    height: 100,
    marginBottom: 5,
  },
  charCount: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'right',
    marginBottom: 20,
  },
  statusMessage: {
    fontSize: 13,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusError: {
    color: '#FF4444',
    backgroundColor: '#2E0A0A',
  },
  statusSuccess: {
    color: '#4CAF50',
    backgroundColor: '#0A2E0A',
  },
  saveButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
  },
});