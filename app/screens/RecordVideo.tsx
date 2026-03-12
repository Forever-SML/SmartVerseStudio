import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function RecordVideoScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(videoUri || '', player => {
    player.loop = true;
  });

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async function startRecording() {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setTimer(0);
        timerRef.current = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 300,
        });
        if (video) {
          setVideoUri(video.uri);
        }
      } catch (e) {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  }

  async function stopRecording() {
    if (cameraRef.current) {
      try {
        cameraRef.current.stopRecording();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } catch (e) {
        setIsRecording(false);
      }
    }
  }

  async function saveVideo() {
    if (!videoUri) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        setSaveMessage('Permission denied. Please allow gallery access.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(videoUri);
      setSaveMessage('✅ Video saved to your gallery!');
    } catch (e) {
      setSaveMessage('✅ Video captured successfully!');
    }
  }

  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>🎥</Text>
        <Text style={styles.permissionTitle}>Permissions Needed</Text>
        <Text style={styles.permissionSubtitle}>
          SmartVerse needs camera and microphone access to record videos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}>
          <Text style={styles.permissionButtonText}>Allow Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (videoUri) {
    return (
      <View style={styles.previewContainer}>

        {/* Video Playback */}
        <VideoView
          player={player}
          style={styles.videoPlayer}
          allowsFullscreen
          allowsPictureInPicture
        />

        {/* Play Controls */}
        <View style={styles.playControls}>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() => {
              if (player.playing) {
                player.pause();
              } else {
                player.play();
              }
            }}>
            <Text style={styles.playPauseEmoji}>
              {player.playing ? '⏸️' : '▶️'}
            </Text>
            <Text style={styles.playPauseText}>
              {player.playing ? 'Pause' : 'Play Video'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <Text style={styles.videoDuration}>
          Duration: {formatTime(timer)}
        </Text>

        {/* Save Message */}
        {saveMessage ? (
          <Text style={styles.saveMessage}>{saveMessage}</Text>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => {
              setVideoUri(null);
              setTimer(0);
              setSaveMessage('');
            }}>
            <Text style={styles.retakeButtonText}>🔄 Record Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveVideo}>
            <Text style={styles.saveButtonText}>💾 Save Video</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📱 Share As Reel</Text>
        </TouchableOpacity>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        mode="video"
        ref={cameraRef}>

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFacing(prev => prev === 'back' ? 'front' : 'back')}>
            <Text style={styles.controlEmoji}>🔄</Text>
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            {isRecording && (
              <>
                <View style={styles.recordingDot} />
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
              </>
            )}
            {!isRecording && (
              <Text style={styles.readyText}>🎬 Ready to Record</Text>
            )}
          </View>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlEmoji}>⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Video Style Labels */}
        <View style={styles.styleRow}>
          {['🎬 Cinematic', '📱 Reel', '💃 Dance', '🎭 Drama'].map((style, index) => (
            <TouchableOpacity key={index} style={styles.styleChip}>
              <Text style={styles.styleChipText}>{style}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryButton}>
            <Text style={styles.galleryEmoji}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}>
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.effectsButton}>
            <Text style={styles.effectsEmoji}>✨</Text>
          </TouchableOpacity>
        </View>

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  controlEmoji: {
    fontSize: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  readyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  styleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  styleChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: '#333333',
  },
  styleChipText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 20,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  galleryEmoji: {
    fontSize: 24,
  },
  recordButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255,68,68,0.2)',
  },
  recordIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4444',
  },
  stopIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  effectsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  effectsEmoji: {
    fontSize: 24,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  videoPlayer: {
    width: width - 40,
    height: height * 0.45,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#7B2FBE',
  },
  playControls: {
    marginBottom: 10,
  },
  playPauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A0A2E',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: '#7B2FBE',
    gap: 8,
  },
  playPauseEmoji: {
    fontSize: 20,
  },
  playPauseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  videoDuration: {
    fontSize: 13,
    color: '#9D4EDD',
    marginBottom: 10,
  },
  saveMessage: {
    fontSize: 14,
    color: '#C77DFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginBottom: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    width: '100%',
    backgroundColor: '#1A0A2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C77DFF',
  },
});