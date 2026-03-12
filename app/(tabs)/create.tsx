import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const videoStyles = [
  { id: '1', emoji: '🎬', title: 'Cinematic' },
  { id: '2', emoji: '📱', title: 'Reel' },
  { id: '3', emoji: '🎭', title: 'Drama' },
  { id: '4', emoji: '😂', title: 'Comedy' },
  { id: '5', emoji: '📰', title: 'Vlog' },
  { id: '6', emoji: '🎓', title: 'Tutorial' },
  { id: '7', emoji: '🌍', title: 'Documentary' },
  { id: '8', emoji: '💃', title: 'Dance' },
];

const filters = [
  { id: '1', emoji: '✨', title: 'Glam' },
  { id: '2', emoji: '🌅', title: 'Warm' },
  { id: '3', emoji: '🌊', title: 'Cool' },
  { id: '4', emoji: '⚫', title: 'Dark' },
  { id: '5', emoji: '🌈', title: 'Vivid' },
  { id: '6', emoji: '📷', title: 'Classic' },
];

export default function CreateScreen() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Lights Camera Action</Text>
        <Text style={styles.title}>🎬 Create</Text>
        <Text style={styles.subtitle}>Tell your story your way</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.cameraSection}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => router.push('/screens/RecordVideo')}>
            <Text style={styles.cameraEmoji}>🎥</Text>
            <Text style={styles.cameraText}>Record Video</Text>
            <Text style={styles.cameraSubtext}>Tap to open video camera</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/screens/AICamera')}>
            <Text style={styles.quickEmoji}>📸</Text>
            <Text style={styles.quickTitle}>AI Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/screens/RecordVideo')}>
            <Text style={styles.quickEmoji}>📱</Text>
            <Text style={styles.quickTitle}>Make Reel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/screens/EditVideo')}>
            <Text style={styles.quickEmoji}>✂️</Text>
            <Text style={styles.quickTitle}>Edit Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/screens/GoLive')}>
            <Text style={styles.quickEmoji}>🔴</Text>
            <Text style={styles.quickTitle}>Go Live</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}>
          {videoStyles.map(style => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleCard,
                selectedStyle === style.id && styles.styleCardActive,
              ]}
              onPress={() => setSelectedStyle(style.id)}>
              <Text style={styles.styleEmoji}>{style.emoji}</Text>
              <Text style={[
                styles.styleTitle,
                selectedStyle === style.id && styles.styleTitleActive,
              ]}>
                {style.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Filters</Text>
        <View style={styles.filtersGrid}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterCard,
                selectedFilter === filter.id && styles.filterCardActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}>
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[
                styles.filterTitle,
                selectedFilter === filter.id && styles.filterTitleActive,
              ]}>
                {filter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiText}>AI Director</Text>
          <Text style={styles.aiSubtext}>
            AI will direct and enhance your video
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.collabButton}
          onPress={() => router.push('/screens/Collaborate')}>
          <Text style={styles.collabEmoji}>🤝</Text>
          <Text style={styles.collabText}>Collaborate</Text>
          <Text style={styles.collabSubtext}>
            Create amazing things with other creators
          </Text>
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
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  greeting: {
    fontSize: 13,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#C77DFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#9D4EDD',
    marginTop: 2,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cameraSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  cameraButton: {
    width: width - 60,
    backgroundColor: '#0A1A2E',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7B2FBE',
  },
  cameraEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  cameraText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  cameraSubtext: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    letterSpacing: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quickCard: {
    width: (width - 55) / 4,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  quickEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickTitle: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  horizontalScroll: {
    paddingBottom: 20,
    paddingRight: 15,
  },
  styleCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 80,
  },
  styleCardActive: {
    borderColor: '#C77DFF',
    backgroundColor: '#1A0A2E',
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  styleTitle: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  styleTitleActive: {
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  filterCard: {
    width: (width - 55) / 3,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterCardActive: {
    borderColor: '#C77DFF',
    backgroundColor: '#1A0A2E',
  },
  filterEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  filterTitle: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  filterTitleActive: {
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  aiButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  aiEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  aiText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiSubtext: {
    fontSize: 12,
    color: '#E0AAFF',
    textAlign: 'center',
  },
  collabButton: {
    backgroundColor: '#1A0A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  collabEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  collabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 4,
  },
  collabSubtext: {
    fontSize: 12,
    color: '#9D4EDD',
    textAlign: 'center',
  },
});