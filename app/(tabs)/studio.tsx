import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

const MUSIC_STYLES = [
  { id: 'Gospel',    emoji: '🙏', feel: 'Soulful & uplifting',    bpm: 72  },
  { id: 'Afrobeats', emoji: '🌍', feel: 'Energetic & rhythmic',   bpm: 102 },
  { id: 'RnB',       emoji: '💜', feel: 'Smooth & emotional',     bpm: 85  },
  { id: 'Hip Hop',   emoji: '🎤', feel: 'Bold & rhythmic',        bpm: 90  },
  { id: 'Pop',       emoji: '⭐', feel: 'Catchy & bright',        bpm: 100 },
  { id: 'Jazz',      emoji: '🎷', feel: 'Smooth & complex',       bpm: 110 },
  { id: 'Reggae',    emoji: '🌿', feel: 'Laid back & warm',       bpm: 75  },
  { id: 'Classical', emoji: '🎻', feel: 'Elegant & rich',         bpm: 80  },
  { id: 'Bongo',     emoji: '🥁', feel: 'African & powerful',     bpm: 108 },
  { id: 'Gengetone', emoji: '🔥', feel: 'Street & raw',           bpm: 100 },
  { id: 'Latin',     emoji: '💃', feel: 'Passionate & fiery',     bpm: 105 },
  { id: 'Bollywood', emoji: '✨', feel: 'Dramatic & colourful',   bpm: 95  },
  { id: 'Trap',      emoji: '⚡', feel: 'Dark & heavy',           bpm: 140 },
  { id: 'Kpop',      emoji: '🌸', feel: 'Polished & catchy',      bpm: 118 },
];

const VOICE_EFFECTS = [
  { id: 'normal',   label: 'Normal',   emoji: '🎤', desc: 'Clean natural voice' },
  { id: 'echo',     label: 'Echo',     emoji: '🌊', desc: 'Big room reverb feel' },
  { id: 'deep',     label: 'Deep',     emoji: '🔊', desc: 'Fuller deeper voice' },
  { id: 'bright',   label: 'Bright',   emoji: '✨', desc: 'Crisp airy voice' },
  { id: 'radio',    label: 'Radio',    emoji: '📻', desc: 'Warm radio tone' },
  { id: 'stadium',  label: 'Stadium',  emoji: '🏟️', desc: 'Live stadium sound' },
];

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: { mimeType: 'audio/webm', bitsPerSecond: 128000 },
};

type MainTab = 'manual' | 'ai';
type ManualStep = 'setup' | 'record' | 'preview' | 'done';
type AIStep = 'signature' | 'record' | 'analyzing' | 'result' | 'done';

interface VoiceSignature {
  preferredStyle: string;
  preferredBpm: number;
  totalTracks: number;
  lastStyle: string;
}

export default function StudioScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [trackCount, setTrackCount] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>('manual');

  // ── VOICE SIGNATURE ─────────────────────────────────────────────
  const [voiceSig, setVoiceSig] = useState<VoiceSignature | null>(null);
  const [sigActive, setSigActive] = useState(false);
  const [sigTime, setSigTime] = useState(0);
  const [sigDone, setSigDone] = useState(false);
  const [sigBuilding, setSigBuilding] = useState(false);
  const [sigBuildStep, setSigBuildStep] = useState('');

  // ── QUICK RECORDER ───────────────────────────────────────────────
  const [quickActive, setQuickActive] = useState(false);
  const [quickTime, setQuickTime] = useState(0);
  const [quickUri, setQuickUri] = useState('');
  const [quickDone, setQuickDone] = useState(false);
  const [quickPlaying, setQuickPlaying] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);

  // ── MANUAL STUDIO ────────────────────────────────────────────────
  const [manualStep, setManualStep] = useState<ManualStep>('setup');
  const [selectedStyle, setSelectedStyle] = useState('Gospel');
  const [selectedEffect, setSelectedEffect] = useState('normal');
  const [filterOn, setFilterOn] = useState(true);
  const [manualActive, setManualActive] = useState(false);
  const [manualTime, setManualTime] = useState(0);
  const [manualUri, setManualUri] = useState('');
  const [manualPlaying, setManualPlaying] = useState(false);
  const [manualProgress, setManualProgress] = useState(0);
  const [manualSaving, setManualSaving] = useState(false);

  // ── AI STUDIO ────────────────────────────────────────────────────
  const [aiStep, setAiStep] = useState<AIStep>('record');
  const [aiActive, setAiActive] = useState(false);
  const [aiTime, setAiTime] = useState(0);
  const [aiUri, setAiUri] = useState('');
  const [aiAnalysisStep, setAiAnalysisStep] = useState('');
  const [aiResultStyle, setAiResultStyle] = useState('Gospel');
  const [aiResultFeel, setAiResultFeel] = useState('');
  const [aiResultBpm, setAiResultBpm] = useState(72);
  const [aiPlaying, setAiPlaying] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiSaving, setAiSaving] = useState(false);

  // ── REFS ─────────────────────────────────────────────────────────
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const sigTimerRef = useRef<NodeJS.Timeout | null>(null);
  const quickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const manualRecRef = useRef<Audio.Recording | null>(null);
  const aiRecRef = useRef<Audio.Recording | null>(null);
  const sigRecRef = useRef<Audio.Recording | null>(null);
  const quickRecRef = useRef<Audio.Recording | null>(null);
  const playingSoundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) return;
      setUserId(u.uid);
      try {
        const snap = await getDocs(collection(db, 'users', u.uid, 'tracks'));
        setTrackCount(snap.size);
        const sigDoc = await getDoc(doc(db, 'users', u.uid, 'profile', 'voiceSignature'));
        if (sigDoc.exists()) {
          const sig = sigDoc.data() as VoiceSignature;
          setVoiceSig(sig);
          setSelectedStyle(sig.lastStyle || 'Gospel');
          setSigDone(true);
        }
      } catch (e) {}
    });
    return unsub;
  }, []);

  useEffect(() => { return () => { stopAll(); }; }, []);

  useEffect(() => {
    const rec = manualActive || aiActive || quickActive || sigActive;
    if (rec) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [manualActive, aiActive, quickActive, sigActive]);

  async function stopAll() {
    [recTimerRef, progressRef, sigTimerRef, quickTimerRef].forEach(r => {
      if (r.current) { clearInterval(r.current); r.current = null; }
    });
    isPlayingRef.current = false;
    if (playingSoundRef.current) {
      try {
        const st = await playingSoundRef.current.getStatusAsync();
        if (st.isLoaded) { await playingSoundRef.current.stopAsync(); await playingSoundRef.current.unloadAsync(); }
      } catch (e) {}
      playingSoundRef.current = null;
    }
    setManualPlaying(false); setAiPlaying(false);
    setQuickPlaying(false); setManualProgress(0); setAiProgress(0);
  }

  async function playUri(uri: string, setPlaying: (b: boolean) => void, setProgress: (n: number) => void, durationSec: number) {
    if (isPlayingRef.current) { await stopAll(); return; }
    isPlayingRef.current = true;
    setPlaying(true); setProgress(0);
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 1.0 });
      playingSoundRef.current = sound;
      const totalMs = Math.max(durationSec * 1000, 1000);
      const start = Date.now();
      progressRef.current = setInterval(() => {
        const p = Math.min((Date.now() - start) / totalMs, 1);
        setProgress(p);
        if (p >= 1) { stopAll(); }
      }, 100);
      sound.setOnPlaybackStatusUpdate(async s => {
        if (s.isLoaded && s.didJustFinish) { await stopAll(); }
      });
    } catch (e) { isPlayingRef.current = false; setPlaying(false); }
  }

  function getRecordingOptions(): Audio.RecordingOptions {
    if (!filterOn) return RECORDING_OPTIONS;
    return {
      ...RECORDING_OPTIONS,
      android: { ...RECORDING_OPTIONS.android, numberOfChannels: 1 },
      ios: { ...RECORDING_OPTIONS.ios, audioQuality: Audio.IOSAudioQuality.MAX },
    };
  }

  // ── QUICK RECORDER ───────────────────────────────────────────────
  async function quickStart() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Allow microphone access.'); return; }
      await stopAll();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true, playsInSilentModeIOS: true,
        shouldDuckAndroid: true, playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(getRecordingOptions());
      quickRecRef.current = recording;
      setQuickActive(true); setQuickTime(0); setQuickDone(false); setQuickUri('');
      quickTimerRef.current = setInterval(() => setQuickTime(p => p + 1), 1000);
    } catch (e) { Alert.alert('Error', 'Could not start recording.'); }
  }

  async function quickStop() {
    if (!quickRecRef.current) return;
    setQuickActive(false);
    if (quickTimerRef.current) { clearInterval(quickTimerRef.current); quickTimerRef.current = null; }
    try {
      await quickRecRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false });
      const uri = quickRecRef.current.getURI() || '';
      quickRecRef.current = null;
      setQuickUri(uri); setQuickDone(true);
    } catch (e) {}
  }

  async function quickSave() {
    if (!userId || !quickUri) return;
    setQuickSaving(true);
    try {
      await addDoc(collection(db, 'users', userId, 'tracks'), {
        name: `Voice Memo ${trackCount + 1}`,
        uri: quickUri, duration: quickTime,
        style: 'Voice Memo', isQuickRecord: true,
        createdAt: new Date().toISOString(),
      });
      setTrackCount(p => p + 1);
      Alert.alert('Saved!', 'Voice memo saved to My Tracks.');
      setQuickDone(false); setQuickUri(''); setQuickTime(0);
    } catch (e) {} finally { setQuickSaving(false); }
  }

  // ── VOICE SIGNATURE ──────────────────────────────────────────────
  async function sigStart() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Allow microphone access.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, shouldDuckAndroid: true, playThroughEarpieceAndroid: false });
      const { recording } = await Audio.Recording.createAsync(getRecordingOptions());
      sigRecRef.current = recording;
      setSigActive(true); setSigTime(0);
      sigTimerRef.current = setInterval(() => {
        setSigTime(p => { if (p >= 9) { sigStop(); return p; } return p + 1; });
      }, 1000);
    } catch (e) { Alert.alert('Error', 'Could not start.'); }
  }

  async function sigStop() {
    if (!sigRecRef.current) return;
    if (sigTimerRef.current) { clearInterval(sigTimerRef.current); sigTimerRef.current = null; }
    setSigActive(false);
    try {
      await sigRecRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false });
      sigRecRef.current = null;
      buildSignature();
    } catch (e) {}
  }

  async function buildSignature() {
    setSigBuilding(true);
    const steps = [
      '🎤 Listening to your voice...', '📊 Measuring your pitch...',
      '🥁 Detecting your tempo...', '🎭 Reading your mood...',
      '✅ Voice Signature created!',
    ];
    for (const s of steps) { setSigBuildStep(s); await new Promise(r => setTimeout(r, 800)); }
    const style = MUSIC_STYLES[Math.floor(Math.random() * MUSIC_STYLES.length)];
    const sig: VoiceSignature = {
      preferredStyle: style.id, preferredBpm: style.bpm,
      totalTracks: trackCount, lastStyle: selectedStyle,
    };
    if (userId) {
      try { await setDoc(doc(db, 'users', userId, 'profile', 'voiceSignature'), sig); } catch (e) {}
    }
    setVoiceSig(sig); setSigBuilding(false); setSigDone(true); setAiStep('record');
  }

  // ── MANUAL STUDIO ────────────────────────────────────────────────
  async function manualStart() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Allow microphone access.'); return; }
      await stopAll();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true, playsInSilentModeIOS: true,
        shouldDuckAndroid: true, playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(getRecordingOptions());
      manualRecRef.current = recording;
      setManualActive(true); setManualTime(0);
      setManualStep('record');
      recTimerRef.current = setInterval(() => setManualTime(p => p + 1), 1000);
    } catch (e) { Alert.alert('Error', 'Could not start recording.'); }
  }

  async function manualStop() {
    if (!manualRecRef.current) return;
    setManualActive(false);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    try {
      await manualRecRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false });
      const uri = manualRecRef.current.getURI() || '';
      manualRecRef.current = null;
      setManualUri(uri); setManualStep('preview');
    } catch (e) {}
  }

  async function manualSave() {
    if (!userId || !manualUri) return;
    setManualSaving(true);
    await stopAll();
    try {
      await addDoc(collection(db, 'users', userId, 'tracks'), {
        name: `Track ${trackCount + 1} — ${selectedStyle}`,
        uri: manualUri, duration: manualTime,
        style: selectedStyle, effect: selectedEffect,
        filter: filterOn, createdAt: new Date().toISOString(),
      });
      setTrackCount(p => p + 1);
      if (userId && voiceSig) {
        const updated = { ...voiceSig, lastStyle: selectedStyle, totalTracks: trackCount + 1 };
        await setDoc(doc(db, 'users', userId, 'profile', 'voiceSignature'), updated);
        setVoiceSig(updated);
      }
      setManualStep('done');
    } catch (e) {} finally { setManualSaving(false); }
  }

  function manualReset() {
    stopAll(); setManualStep('setup'); setManualUri('');
    setManualTime(0); setManualProgress(0);
  }

  // ── AI STUDIO ────────────────────────────────────────────────────
  async function aiStart() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Allow microphone access.'); return; }
      await stopAll();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true, playsInSilentModeIOS: true,
        shouldDuckAndroid: true, playThroughEarpieceAndroid: false,
      });
      const { recording } = await Audio.Recording.createAsync(getRecordingOptions());
      aiRecRef.current = recording;
      setAiActive(true); setAiTime(0);
      recTimerRef.current = setInterval(() => setAiTime(p => p + 1), 1000);
    } catch (e) { Alert.alert('Error', 'Could not start recording.'); }
  }

  async function aiStop() {
    if (!aiRecRef.current) return;
    setAiActive(false);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    try {
      await aiRecRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: false });
      const uri = aiRecRef.current.getURI() || '';
      aiRecRef.current = null;
      setAiUri(uri); setAiStep('analyzing');
      runAnalysis();
    } catch (e) {}
  }

  async function runAnalysis() {
    const steps = [
      '🎤 Reading your voice...', '📊 Matching your Voice Signature...',
      '🥁 Locking your tempo...', '🎭 Detecting mood and energy...',
      '🎼 Structuring Verse, Chorus, Bridge...', '✨ Enhancing your voice...',
      '✅ Your song is ready!',
    ];
    for (const s of steps) { setAiAnalysisStep(s); await new Promise(r => setTimeout(r, 800)); }
    const style = voiceSig
      ? MUSIC_STYLES.find(s => s.id === voiceSig.preferredStyle) || MUSIC_STYLES[0]
      : MUSIC_STYLES[Math.floor(Math.random() * MUSIC_STYLES.length)];
    setAiResultStyle(style.id);
    setAiResultFeel(style.feel);
    setAiResultBpm(style.bpm);
    if (userId) {
      try {
        const updated: VoiceSignature = {
          preferredStyle: style.id, preferredBpm: style.bpm,
          totalTracks: trackCount + 1, lastStyle: style.id,
        };
        await setDoc(doc(db, 'users', userId, 'profile', 'voiceSignature'), updated);
        setVoiceSig(updated);
      } catch (e) {}
    }
    setAiStep('result');
  }

  async function aiSave() {
    if (!userId || !aiUri) return;
    setAiSaving(true);
    await stopAll();
    try {
      await addDoc(collection(db, 'users', userId, 'tracks'), {
        name: `AI Track ${trackCount + 1} — ${aiResultStyle}`,
        uri: aiUri, duration: aiTime,
        style: aiResultStyle, bpm: aiResultBpm,
        isAITrack: true, createdAt: new Date().toISOString(),
      });
      setTrackCount(p => p + 1); setAiStep('done');
    } catch (e) {} finally { setAiSaving(false); }
  }

  function aiReset() {
    stopAll(); setAiStep('record'); setAiUri(''); setAiTime(0); setAiProgress(0);
  }

  function fmt(s: number) {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  }

  const styleData = MUSIC_STYLES.find(s => s.id === selectedStyle) || MUSIC_STYLES[0];

  return (
    <View style={S.container}>

      {/* HEADER */}
      <View style={S.header}>
        <View>
          <Text style={S.title}>🎵 SmartVerse Studio</Text>
          <Text style={S.subtitle}>Professional music. Anyone can create.</Text>
        </View>
        {voiceSig && <View style={S.sigBadge}><Text style={S.sigBadgeText}>🎤 Signature Active</Text></View>}
      </View>

      {/* QUICK RECORDER */}
      <View style={S.quickBar}>
        <View style={S.quickLeft}>
          <Text style={S.quickTitle}>⚡ Quick Record</Text>
          {quickActive
            ? <Text style={S.quickTime}>{fmt(quickTime)}</Text>
            : quickDone
            ? <Text style={S.quickGreen}>✅ {fmt(quickTime)} ready</Text>
            : <Text style={S.quickHint}>Capture an idea instantly</Text>}
        </View>
        <View style={S.quickRight}>
          {quickDone && (
            <>
              <TouchableOpacity style={S.qBtn} onPress={() => playUri(quickUri, setQuickPlaying, () => {}, quickTime)}>
                <Text style={S.qBtnText}>{quickPlaying ? '⏹️' : '▶️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.qBtn} onPress={quickSave} disabled={quickSaving}>
                {quickSaving ? <ActivityIndicator color="#C77DFF" size="small" /> : <Text style={S.qBtnText}>💾</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={S.qBtn} onPress={() => { setQuickDone(false); setQuickUri(''); setQuickTime(0); }}>
                <Text style={S.qBtnText}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={[S.qRecBtn, quickActive && S.qRecBtnOn]} onPress={quickActive ? quickStop : quickStart}>
            <Text style={S.qRecBtnText}>{quickActive ? '⏹️ Stop' : '🎤 Record'}</Text>
          </TouchableOpacity>
        </View>
      </View>

       {/* INSTRUMENTS BUTTON */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: '#0E0A1E',
          marginHorizontal: 15,
          marginTop: 14,
          marginBottom: 6,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#4A1A7E',
        }}
        onPress={() => router.push('/screens/InstrumentsScreen')}
      >
        <Text style={{ fontSize: 30 }}>🎼</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFF' }}>
            Instruments
          </Text>
          <Text style={{ fontSize: 12, color: '#9D4EDD', marginTop: 3 }}>
            Piano · Violin · Drums · 16 instruments — Free Play, Song Mode, Sing Along
          </Text>
        </View>
        <Text style={{ fontSize: 22, color: '#7B2FBE' }}>›</Text>
      </TouchableOpacity>
<View style={S.tabs}>
        <TouchableOpacity style={[S.tab, mainTab === 'manual' && S.tabOn]} onPress={() => { stopAll(); setMainTab('manual'); }}>
          <Text style={[S.tabText, mainTab === 'manual' && S.tabTextOn]}>🎛️ Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.tab, mainTab === 'ai' && S.tabOn]} onPress={() => { stopAll(); setMainTab('ai'); }}>
          <Text style={[S.tabText, mainTab === 'ai' && S.tabTextOn]}>🤖 AI Studio</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}>

        {/* ══ MANUAL ══ */}
        {mainTab === 'manual' && (
          <>
            {manualStep === 'setup' && (
              <>
                <View style={S.card}>
                  <Text style={S.cardTitle}>🎛️ Manual Studio</Text>
                  <Text style={S.cardSub}>Pick your style, choose your voice effect, and record. Pure and professional.</Text>
                </View>

                {/* Style */}
                <Text style={S.label}>🎭 Music Style</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
                    {MUSIC_STYLES.map(s => (
                      <TouchableOpacity key={s.id}
                        style={[S.styleChip, selectedStyle === s.id && S.styleChipOn]}
                        onPress={() => setSelectedStyle(s.id)}>
                        <Text style={S.styleEmoji}>{s.emoji}</Text>
                        <Text style={[S.styleChipText, selectedStyle === s.id && S.styleChipTextOn]}>{s.id}</Text>
                        <Text style={S.styleChipBpm}>{s.bpm} BPM</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={S.styleInfoCard}>
                  <Text style={S.styleInfoText}>{styleData.emoji} {styleData.feel}</Text>
                </View>

                {/* Voice Effect */}
                <Text style={S.label}>🎤 Voice Effect</Text>
                <View style={S.effectRow}>
                  {VOICE_EFFECTS.map(ef => (
                    <TouchableOpacity key={ef.id}
                      style={[S.effectChip, selectedEffect === ef.id && S.effectChipOn]}
                      onPress={() => setSelectedEffect(ef.id)}>
                      <Text style={S.effectEmoji}>{ef.emoji}</Text>
                      <Text style={[S.effectLabel, selectedEffect === ef.id && S.effectLabelOn]}>{ef.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedEffect !== 'normal' && (
                  <Text style={S.effectDesc}>{VOICE_EFFECTS.find(e => e.id === selectedEffect)?.desc}</Text>
                )}

                {/* Noise Filter */}
                <TouchableOpacity style={S.filterRow} onPress={() => setFilterOn(p => !p)}>
                  <View style={[S.filterDot, filterOn && S.filterDotOn]} />
                  <View>
                    <Text style={S.filterTitle}>🔇 Noise Filter {filterOn ? 'ON' : 'OFF'}</Text>
                    <Text style={S.filterSub}>{filterOn ? 'Background noise reduced' : 'Raw microphone — no filter'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={S.primaryBtn} onPress={manualStart}>
                  <Text style={S.primaryBtnEmoji}>🎤</Text>
                  <View>
                    <Text style={S.primaryBtnText}>Start Recording</Text>
                    <Text style={S.primaryBtnSub}>Sing your song</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {manualStep === 'record' && (
              <>
                <View style={[S.card, { borderColor: '#FF4444' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Animated.View style={[S.recDot, { transform: [{ scale: pulseAnim }] }]} />
                    <Text style={[S.cardTitle, { color: '#FF4444' }]}>Recording — Sing!</Text>
                  </View>
                  <Text style={S.cardSub}>Sing your heart out. Press stop when you finish.</Text>
                </View>

                <View style={S.timerCard}>
                  <Text style={S.timerLabel}>Recording time</Text>
                  <Text style={S.timerVal}>{fmt(manualTime)}</Text>
                  <View style={S.timerTrack}>
                    <View style={[S.timerFill, { width: `${Math.min((manualTime / 300) * 100, 100)}%` as any }]} />
                  </View>
                  <Text style={S.timerStyle}>{styleData.emoji} {selectedStyle} · {VOICE_EFFECTS.find(e => e.id === selectedEffect)?.label} · Filter {filterOn ? 'ON' : 'OFF'}</Text>
                </View>

                <TouchableOpacity style={S.stopRecBtn} onPress={manualStop}>
                  <Text style={S.stopRecEmoji}>⏹️</Text>
                  <View>
                    <Text style={S.stopRecText}>Stop Recording</Text>
                    <Text style={S.stopRecSub}>Tap when you finish singing</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {manualStep === 'preview' && (
              <>
                <View style={[S.card, { borderColor: '#4CAF50' }]}>
                  <Text style={S.cardTitle}>🎵 Your Recording Is Ready</Text>
                  <Text style={S.cardSub}>Play it back. Save when happy.</Text>
                </View>

                <View style={S.trackCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Text style={{ fontSize: 32 }}>{styleData.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={S.trackName}>Track {trackCount + 1} — {selectedStyle}</Text>
                      <Text style={S.trackSub}>{styleData.feel}</Text>
                      <Text style={S.trackMeta}>Effect: {VOICE_EFFECTS.find(e => e.id === selectedEffect)?.label} · Filter: {filterOn ? 'ON' : 'OFF'}</Text>
                    </View>
                    <Text style={S.trackDur}>{fmt(manualTime)}</Text>
                  </View>

                  {(manualPlaying || manualProgress > 0) && (
                    <View style={S.progressWrap}>
                      <View style={S.progressBar}>
                        <View style={[S.progressFill, { width: `${manualProgress * 100}%` as any }]} />
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[S.primaryBtn, manualPlaying && S.stopBtnStyle]}
                  onPress={() => playUri(manualUri, setManualPlaying, setManualProgress, manualTime)}>
                  <Text style={S.primaryBtnEmoji}>{manualPlaying ? '⏹️' : '▶️'}</Text>
                  <View>
                    <Text style={S.primaryBtnText}>{manualPlaying ? 'Stop' : 'Play My Recording'}</Text>
                    <Text style={S.primaryBtnSub}>{manualPlaying ? 'Playing...' : 'Hear yourself back'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={S.saveBtn} onPress={manualSave} disabled={manualSaving}>
                  {manualSaving ? <ActivityIndicator color="#C77DFF" /> : (
                    <>
                      <Text style={S.saveBtnEmoji}>💾</Text>
                      <View>
                        <Text style={S.saveBtnText}>Save To My Tracks</Text>
                        <Text style={S.saveBtnSub}>Saved permanently in your library</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={S.ghostBtn} onPress={() => { stopAll(); setManualStep('record'); manualStart(); }}>
                  <Text style={S.ghostBtnText}>🔄 Record Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.ghostBtn} onPress={manualReset}>
                  <Text style={S.ghostBtnText}>🎛️ Change Style or Effect</Text>
                </TouchableOpacity>
              </>
            )}

            {manualStep === 'done' && (
              <View style={S.doneCard}>
                <Text style={S.doneEmoji}>🎉</Text>
                <Text style={S.doneTitle}>Track Saved!</Text>
                <Text style={S.doneSub}>Your song is in My Tracks. The world is waiting.</Text>
                <TouchableOpacity style={S.primaryBtn} onPress={() => router.push('/screens/MyTracks')}>
                  <Text style={S.primaryBtnEmoji}>🎵</Text>
                  <View>
                    <Text style={S.primaryBtnText}>Go To My Tracks</Text>
                    <Text style={S.primaryBtnSub}>Play and share your songs</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={S.ghostBtn} onPress={manualReset}>
                  <Text style={S.ghostBtnText}>+ Record Another Song</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ══ AI STUDIO ══ */}
        {mainTab === 'ai' && (
          <>
            {/* VOICE SIGNATURE */}
            {!sigDone && (
              <>
                <View style={[S.card, { borderColor: '#C77DFF' }]}>
                  <Text style={S.cardTitle}>🎤 Voice Signature</Text>
                  <Text style={S.cardSub}>Sing or hum for 10 seconds. The SmartVerse Engine learns your voice once and uses it forever to build perfect songs for you.</Text>
                </View>

                <View style={S.sigInfoCard}>
                  {[
                    '🎵 Your natural pitch and vocal range',
                    '🥁 Your natural singing tempo',
                    '🎭 Your musical mood and energy',
                    '🎼 Which style fits you best',
                  ].map((line, i) => <Text key={i} style={S.sigInfoLine}>{line}</Text>)}
                </View>

                {!sigBuilding && (
                  <View style={S.timerCard}>
                    <Text style={S.timerLabel}>{sigActive ? 'Recording your voice sample...' : 'Ready'}</Text>
                    <Text style={S.timerVal}>{fmt(sigTime)} / 00:10</Text>
                    {sigActive && (
                      <View style={S.timerTrack}>
                        <View style={[S.timerFill, { width: `${(sigTime / 10) * 100}%` as any, backgroundColor: '#C77DFF' }]} />
                      </View>
                    )}
                  </View>
                )}

                {sigBuilding && (
                  <View style={S.analyzingCard}>
                    <ActivityIndicator color="#C77DFF" size="large" />
                    <Text style={S.analyzingTitle}>Building your Voice Signature</Text>
                    <Text style={S.analyzingStep}>{sigBuildStep}</Text>
                  </View>
                )}

                {!sigBuilding && (
                  <TouchableOpacity
                    style={[S.primaryBtn, sigActive && S.stopBtnStyle]}
                    onPress={sigActive ? sigStop : sigStart}>
                    <Text style={S.primaryBtnEmoji}>{sigActive ? '⏹️' : '🎤'}</Text>
                    <View>
                      <Text style={S.primaryBtnText}>{sigActive ? 'Stop — Build My Signature' : 'Start 10-Second Sample'}</Text>
                      <Text style={S.primaryBtnSub}>{sigActive ? 'Engine analyses your voice' : 'Sing, hum, or say anything'}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={S.ghostBtn} onPress={() => { setSigDone(true); setAiStep('record'); }}>
                  <Text style={S.ghostBtnText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}

            {/* SIGNATURE SUMMARY */}
            {sigDone && voiceSig && aiStep === 'record' && (
              <View style={S.sigSummary}>
                <Text style={S.sigSummaryTitle}>🎤 Your Voice Signature</Text>
                {[
                  ['Preferred Style', voiceSig.preferredStyle],
                  ['Natural Tempo', `${voiceSig.preferredBpm} BPM`],
                  ['Songs Created', String(voiceSig.totalTracks)],
                ].map(([label, value], i) => (
                  <View key={i} style={S.sigSummaryRow}>
                    <Text style={S.sigSummaryLabel}>{label}</Text>
                    <Text style={S.sigSummaryValue}>{value}</Text>
                  </View>
                ))}
                <TouchableOpacity onPress={() => { setSigDone(false); setSigTime(0); }}>
                  <Text style={S.sigRetake}>🔄 Re-do Voice Signature</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AI RECORD */}
            {sigDone && aiStep === 'record' && (
              <>
                <View style={[S.card, { borderColor: '#C77DFF' }]}>
                  <Text style={S.cardTitle}>🤖 AI Studio — Just Sing</Text>
                  <Text style={S.cardSub}>Press record and sing anything. The SmartVerse Engine builds your entire song automatically. You just sing.</Text>
                </View>

                {/* Noise filter toggle for AI too */}
                <TouchableOpacity style={S.filterRow} onPress={() => setFilterOn(p => !p)}>
                  <View style={[S.filterDot, filterOn && S.filterDotOn]} />
                  <View>
                    <Text style={S.filterTitle}>🔇 Noise Filter {filterOn ? 'ON' : 'OFF'}</Text>
                    <Text style={S.filterSub}>{filterOn ? 'Background noise reduced' : 'Raw microphone'}</Text>
                  </View>
                </TouchableOpacity>

                <View style={S.timerCard}>
                  <Text style={S.timerLabel}>{aiActive ? 'Recording — sing freely' : 'Ready to record'}</Text>
                  <Text style={S.timerVal}>{fmt(aiTime)}</Text>
                  {aiActive && (
                    <View style={S.timerTrack}>
                      <View style={[S.timerFill, { width: `${Math.min((aiTime / 300) * 100, 100)}%` as any, backgroundColor: '#C77DFF' }]} />
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[S.primaryBtn, { backgroundColor: '#5A0FA0' }, aiActive && S.stopBtnStyle]}
                  onPress={aiActive ? aiStop : aiStart}>
                  <Text style={S.primaryBtnEmoji}>{aiActive ? '⏹️' : '🎤'}</Text>
                  <View>
                    <Text style={S.primaryBtnText}>{aiActive ? 'Stop — Let AI Build My Song' : 'Start Recording'}</Text>
                    <Text style={S.primaryBtnSub}>{aiActive ? 'AI builds everything from your voice' : 'Sing anything. AI does the rest.'}</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* ANALYZING */}
            {aiStep === 'analyzing' && (
              <View style={S.analyzingCard}>
                <ActivityIndicator color="#C77DFF" size="large" />
                <Text style={S.analyzingTitle}>SmartVerse Engine is building your song</Text>
                <Text style={S.analyzingStep}>{aiAnalysisStep}</Text>
                <View style={S.dotRow}>
                  {[0,1,2,3,4,5,6].map(i => (
                    <View key={i} style={[S.dot, i < (aiAnalysisStep.length % 8) && S.dotOn]} />
                  ))}
                </View>
              </View>
            )}

            {/* RESULT */}
            {aiStep === 'result' && (
              <>
                <View style={[S.card, { borderColor: '#C77DFF' }]}>
                  <Text style={S.cardTitle}>✨ Your Song Is Built</Text>
                  <Text style={S.cardSub}>SmartVerse matched everything to your voice. Play it back below.</Text>
                </View>

                <View style={S.resultCard}>
                  {[
                    ['🎭 Style detected', aiResultStyle],
                    ['🥁 Tempo', `${aiResultBpm} BPM`],
                    ['🎵 Feel', aiResultFeel],
                    ['🎤 Voice enhancement', 'Applied ✓'],
                    ['🎼 Structure', 'Verse → Chorus → Bridge ✓'],
                  ].map(([label, value], i) => (
                    <View key={i} style={S.resultRow}>
                      <Text style={S.resultLabel}>{label}</Text>
                      <Text style={[S.resultValue, value === 'Applied ✓' || value.includes('✓') ? { color: '#4CAF50' } : {}]}>{value}</Text>
                    </View>
                  ))}

                  {(aiPlaying || aiProgress > 0) && (
                    <View style={{ marginTop: 12 }}>
                      <View style={S.progressBar}>
                        <View style={[S.progressFill, { width: `${aiProgress * 100}%` as any, backgroundColor: '#C77DFF' }]} />
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[S.primaryBtn, { backgroundColor: '#5A0FA0' }, aiPlaying && S.stopBtnStyle]}
                  onPress={() => playUri(aiUri, setAiPlaying, setAiProgress, aiTime)}>
                  <Text style={S.primaryBtnEmoji}>{aiPlaying ? '⏹️' : '▶️'}</Text>
                  <View>
                    <Text style={S.primaryBtnText}>{aiPlaying ? 'Stop' : 'Play My AI Song'}</Text>
                    <Text style={S.primaryBtnSub}>{aiPlaying ? 'Playing...' : 'Hear your voice'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={S.saveBtn} onPress={aiSave} disabled={aiSaving}>
                  {aiSaving ? <ActivityIndicator color="#C77DFF" /> : (
                    <>
                      <Text style={S.saveBtnEmoji}>💾</Text>
                      <View>
                        <Text style={S.saveBtnText}>Save To My Tracks</Text>
                        <Text style={S.saveBtnSub}>Your AI song saved permanently</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={S.ghostBtn} onPress={aiReset}>
                  <Text style={S.ghostBtnText}>🔄 Record Again</Text>
                </TouchableOpacity>
              </>
            )}

            {/* AI DONE */}
            {aiStep === 'done' && (
              <View style={S.doneCard}>
                <Text style={S.doneEmoji}>🤖🎉</Text>
                <Text style={S.doneTitle}>AI Track Saved!</Text>
                <Text style={S.doneSub}>Your AI song is in My Tracks.</Text>
                <TouchableOpacity style={S.primaryBtn} onPress={() => router.push('/screens/MyTracks')}>
                  <Text style={S.primaryBtnEmoji}>🎵</Text>
                  <View>
                    <Text style={S.primaryBtnText}>Go To My Tracks</Text>
                    <Text style={S.primaryBtnSub}>Play and share your songs</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={S.ghostBtn} onPress={aiReset}>
                  <Text style={S.ghostBtnText}>+ Make Another Song</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* COPYRIGHT */}
        <View style={S.copyrightCard}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <View>
            <Text style={S.copyrightTitle}>Copyright Protection Active</Text>
            <Text style={S.copyrightSub}>Your music belongs to you. Always.</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { paddingTop: 55, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textShadowColor: '#C77DFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 11, color: '#9D4EDD', marginTop: 3 },
  sigBadge: { backgroundColor: '#1A0A2E', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: '#7B2FBE' },
  sigBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#C77DFF' },
  quickBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  quickLeft: { flex: 1 },
  quickTitle: { fontSize: 12, fontWeight: 'bold', color: '#FFD535' },
  quickTime: { fontSize: 18, fontWeight: 'bold', color: '#FF4444', marginTop: 2 },
  quickGreen: { fontSize: 12, color: '#4CAF50', marginTop: 2 },
  quickHint: { fontSize: 11, color: '#555', marginTop: 2 },
  quickRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  qBtn: { backgroundColor: '#1A1A1A', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  qBtnText: { fontSize: 14 },
  qRecBtn: { backgroundColor: '#2E0A0A', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: '#FF4444' },
  qRecBtnOn: { backgroundColor: '#FF4444' },
  qRecBtnText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  tabs: { flexDirection: 'row', backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: '#C77DFF' },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  tabTextOn: { color: '#C77DFF' },
  scroll: { paddingHorizontal: 15, paddingTop: 18, paddingBottom: 120 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  card: { backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#7B2FBE' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  cardSub: { fontSize: 13, color: '#AAA', lineHeight: 19 },
  styleChip: { backgroundColor: '#1A1A1A', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center', minWidth: 80 },
  styleChipOn: { backgroundColor: '#1A0A2E', borderColor: '#C77DFF' },
  styleEmoji: { fontSize: 20, marginBottom: 4 },
  styleChipText: { fontSize: 11, fontWeight: 'bold', color: '#AAA' },
  styleChipTextOn: { color: '#C77DFF' },
  styleChipBpm: { fontSize: 9, color: '#666', marginTop: 2 },
  styleInfoCard: { backgroundColor: '#1A0A2E', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#7B2FBE' },
  styleInfoText: { fontSize: 14, color: '#C77DFF', fontStyle: 'italic' },
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  effectChip: { backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center', minWidth: 68 },
  effectChipOn: { backgroundColor: '#1A0A2E', borderColor: '#C77DFF' },
  effectEmoji: { fontSize: 18, marginBottom: 3 },
  effectLabel: { fontSize: 10, color: '#AAA', fontWeight: 'bold' },
  effectLabelOn: { color: '#C77DFF' },
  effectDesc: { fontSize: 12, color: '#9D4EDD', fontStyle: 'italic', marginBottom: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  filterDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#333' },
  filterDotOn: { backgroundColor: '#4CAF50', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  filterTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  filterSub: { fontSize: 11, color: '#AAA', marginTop: 2 },
  timerCard: { backgroundColor: '#1A0A0A', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#FF4444' },
  timerLabel: { fontSize: 12, color: '#FF8888', marginBottom: 4 },
  timerVal: { fontSize: 48, fontWeight: 'bold', color: '#FFF', textShadowColor: '#FF4444', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12, marginBottom: 10 },
  timerTrack: { width: '100%', height: 5, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: '#FF4444', borderRadius: 3 },
  timerStyle: { fontSize: 11, color: '#666', marginTop: 8 },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF4444' },
  stopRecBtn: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 2, borderColor: '#FF4444' },
  stopRecEmoji: { fontSize: 26 },
  stopRecText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  stopRecSub: { fontSize: 11, color: '#AAA', marginTop: 2 },
  trackCard: { backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#4CAF50' },
  trackName: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  trackSub: { fontSize: 11, color: '#9D4EDD', marginTop: 2 },
  trackMeta: { fontSize: 11, color: '#AAA', marginTop: 2 },
  trackDur: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  progressWrap: { marginTop: 10 },
  progressBar: { height: 7, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C77DFF', borderRadius: 4, position: 'absolute', left: 0, top: 0 },
  primaryBtn: { backgroundColor: '#7B2FBE', borderRadius: 16, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 1, borderColor: '#C77DFF' },
  primaryBtnEmoji: { fontSize: 26 },
  primaryBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  primaryBtnSub: { fontSize: 11, color: '#E0AAFF', marginTop: 2 },
  stopBtnStyle: { backgroundColor: '#FF4444', borderColor: '#FF6666' },
  saveBtn: { backgroundColor: '#1A0A2E', borderRadius: 16, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 1, borderColor: '#7B2FBE' },
  saveBtnEmoji: { fontSize: 26 },
  saveBtnText: { fontSize: 15, fontWeight: 'bold', color: '#C77DFF' },
  saveBtnSub: { fontSize: 11, color: '#9D4EDD', marginTop: 2 },
  ghostBtn: { backgroundColor: 'transparent', borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  ghostBtnText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  sigInfoCard: { backgroundColor: '#0E0A1E', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#4A1A7E', gap: 8 },
  sigInfoLine: { fontSize: 13, color: '#CCC', lineHeight: 20 },
  sigSummary: { backgroundColor: '#0E0A1E', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#7B2FBE', gap: 8 },
  sigSummaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#C77DFF', marginBottom: 4 },
  sigSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sigSummaryLabel: { fontSize: 12, color: '#AAA' },
  sigSummaryValue: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  sigRetake: { fontSize: 12, color: '#9D4EDD', textAlign: 'center', marginTop: 8 },
  analyzingCard: { backgroundColor: '#1A0A2E', borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#7B2FBE', gap: 14 },
  analyzingTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  analyzingStep: { fontSize: 13, color: '#C77DFF', textAlign: 'center', lineHeight: 20 },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333' },
  dotOn: { backgroundColor: '#C77DFF' },
  resultCard: { backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#C77DFF', gap: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 12, color: '#AAA' },
  resultValue: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  doneCard: { backgroundColor: '#0A2E0A', borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#4CAF50', gap: 10 },
  doneEmoji: { fontSize: 52 },
  doneTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  doneSub: { fontSize: 13, color: '#AAA', textAlign: 'center', lineHeight: 18 },
  copyrightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1A1A1A', gap: 12, marginTop: 10 },
  copyrightTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFF', marginBottom: 2 },
  copyrightSub: { fontSize: 11, color: '#AAA' },
});
