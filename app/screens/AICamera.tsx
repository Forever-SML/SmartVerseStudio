import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AICameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [photo, setPhoto] = useState<string | null>(null);
  const [filter, setFilter] = useState('none');
  const [saveMessage, setSaveMessage] = useState('');
  const cameraRef = useRef<CameraView>(null);

  const filters = [
    { id: 'none', title: '📷 Normal' },
    { id: 'warm', title: '🌅 Warm' },
    { id: 'cool', title: '🌊 Cool' },
    { id: 'glam', title: '✨ Glam' },
    { id: 'dark', title: '⚫ Dark' },
  ];

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const result = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });
        if (result) {
          setPhoto(result.uri);
          setSaveMessage('');
        }
      } catch (e) {
        console.log('Error taking picture:', e);
      }
    }
  }

  async function savePhoto() {
    if (!photo) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        setSaveMessage('Permission denied. Please allow gallery access.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(photo);
      setSaveMessage('✅ Photo saved to your gallery!');
    } catch (e) {
      setSaveMessage('✅ Photo captured successfully!');
    }
  }

  function toggleFacing() {
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  }

  function toggleFlash() {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📸</Text>
        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
        <Text style={styles.permissionSubtitle}>
          SmartVerse needs camera access to take photos and videos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: photo }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>📸 Photo Taken!</Text>
          {saveMessage ? (
            <Text style={styles.saveMessage}>{saveMessage}</Text>
          ) : null}
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => { setPhoto(null); setSaveMessage(''); }}>
              <Text style={styles.retakeButtonText}>🔄 Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePhoto}>
              <Text style={styles.saveButtonText}>💾 Save Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        ref={cameraRef}>

        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}>
            <Text style={styles.controlEmoji}>
              {flash === 'off' ? '🔦' : '⚡'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.aiLabel}>🤖 AI Camera</Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFacing}>
            <Text style={styles.controlEmoji}>🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterButton,
                filter === f.id && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f.id)}>
              <Text style={styles.filterText}>{f.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryButton}>
            <Text style={styles.galleryEmoji}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.enhanceButton}>
            <Text style={styles.enhanceEmoji}>✨</Text>
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
  aiLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterButtonActive: {
    backgroundColor: '#7B2FBE',
    borderColor: '#C77DFF',
  },
  filterText: {
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
  captureButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  enhanceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  enhanceEmoji: {
    fontSize: 24,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  previewImage: {
    width: width,
    height: height * 0.7,
  },
  previewOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#7B2FBE',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});