import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        setChecking(false);
      }
    });
    return unsubscribe;
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      setIsError(true);
      setStatusMessage('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsError(false);
      setStatusMessage('✅ Login successful!');
    } catch (error: any) {
      setIsError(true);
      if (error.code === 'auth/user-not-found') {
        setStatusMessage('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setStatusMessage('Incorrect password. Try again.');
      } else if (error.code === 'auth/invalid-email') {
        setStatusMessage('Please enter a valid email address.');
      } else if (error.code === 'auth/invalid-credential') {
        setStatusMessage('Email or password is incorrect.');
      } else {
        setStatusMessage('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!name || !email || !password) {
      setIsError(true);
      setStatusMessage('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setIsError(true);
      setStatusMessage('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        avatar: '🎤',
        bio: '',
        createdAt: new Date().toISOString(),
        tracks: [],
        followers: 0,
        following: 0,
      });
      setIsError(false);
      setStatusMessage('✅ Account created successfully!');
    } catch (error: any) {
      setIsError(true);
      if (error.code === 'auth/email-already-in-use') {
        setStatusMessage('This email is already registered. Try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        setStatusMessage('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setStatusMessage('Password is too weak. Use at least 6 characters.');
      } else {
        setStatusMessage('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🎵</Text>
        <ActivityIndicator color="#C77DFF" size="large" />
        <Text style={styles.loadingText}>Loading SmartVerse...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎵</Text>
          </View>
          <Text style={styles.logoTitle}>SmartVerse</Text>
          <Text style={styles.logoSubtitle}>Studio</Text>
          <Text style={styles.logoTagline}>Your AI Music and Video Platform</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.tabActive]}
            onPress={() => {
              setActiveTab('login');
              setStatusMessage('');
            }}>
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
            onPress={() => {
              setActiveTab('signup');
              setStatusMessage('');
            }}>
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {activeTab === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Your Full Name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {statusMessage ? (
            <Text style={[
              styles.statusMessage,
              isError ? styles.statusError : styles.statusSuccess,
            ]}>
              {statusMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={activeTab === 'login' ? handleLogin : handleSignUp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {activeTab === 'login' ? '🚀 Login' : '✨ Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {activeTab === 'login' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

        </View>

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
  loadingEmoji: {
    fontSize: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C77DFF',
  },
  logoEmoji: {
    fontSize: 36,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoSubtitle: {
    fontSize: 18,
    color: '#9D4EDD',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logoTagline: {
    fontSize: 13,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#7B2FBE',
  },
  tabText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  statusMessage: {
    fontSize: 13,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
  },
  statusError: {
    color: '#FF4444',
    backgroundColor: '#2E0A0A',
  },
  statusSuccess: {
    color: '#4CAF50',
    backgroundColor: '#0A2E0A',
  },
  submitButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  forgotPassword: {
    alignItems: 'center',
    padding: 10,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#9D4EDD',
  },
});
