import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const comments = [
  { id: '1', user: '@musiclover', text: '🔥 This is amazing!', time: '2s' },
  { id: '2', user: '@beatmaker254', text: '❤️ Keep going!', time: '5s' },
  { id: '3', user: '@gospelking', text: '🙏 Blessed!', time: '8s' },
  { id: '4', user: '@producer_ke', text: '🎵 That voice though!', time: '12s' },
  { id: '5', user: '@smartverse_fan', text: '👏 Incredible talent!', time: '15s' },
];

const reactions = ['❤️', '🔥', '👏', '😍', '🎵', '💜'];

export default function GoLiveScreen() {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comment, setComment] = useState('');
  const [visibleComments, setVisibleComments] = useState(comments.slice(0, 3));
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const viewerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { id: '1', emoji: '🎵', title: 'Music' },
    { id: '2', emoji: '🎤', title: 'Singing' },
    { id: '3', emoji: '🎸', title: 'Instruments' },
    { id: '4', emoji: '💬', title: 'Chat' },
    { id: '5', emoji: '🎮', title: 'Gaming' },
    { id: '6', emoji: '🍳', title: 'Cooking' },
  ];

  function formatTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startLive() {
    setIsLive(true);
    setViewers(1);
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    viewerRef.current = setInterval(() => {
      setViewers(prev => Math.min(9999, prev + Math.floor(Math.random() * 5)));
      setLikes(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
  }

  function stopLive() {
    setIsLive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (viewerRef.current) clearInterval(viewerRef.current);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewerRef.current) clearInterval(viewerRef.current);
    };
  }, []);

  if (isLive) {
    return (
      <View style={styles.liveContainer}>

        {/* Camera Preview Area */}
        <View style={styles.cameraArea}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.viewerBadge}>
            <Text style={styles.viewerBadgeText}>👁️ {viewers.toLocaleString()}</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerBadgeText}>⏱️ {formatTime(duration)}</Text>
          </View>
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderEmoji}>📹</Text>
            <Text style={styles.cameraPlaceholderText}>You Are Live!</Text>
            <Text style={styles.cameraPlaceholderSubtext}>
              {viewers.toLocaleString()} people are watching
            </Text>
          </View>
        </View>

        {/* Live Stats */}
        <View style={styles.liveStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{viewers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Viewers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{likes.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatTime(duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>💬 Live Comments</Text>
          {visibleComments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUser}>{comment.user}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentTime}>{comment.time} ago</Text>
            </View>
          ))}
        </View>

        {/* Reactions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reactionsRow}>
          {reactions.map((reaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reactionButton}
              onPress={() => setLikes(prev => prev + 1)}>
              <Text style={styles.reactionEmoji}>{reaction}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* End Live Button */}
        <TouchableOpacity
          style={styles.endLiveButton}
          onPress={stopLive}>
          <Text style={styles.endLiveText}>⏹️ End Live Stream</Text>
        </TouchableOpacity>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔴 Go Live</Text>
        <Text style={styles.subtitle}>Stream to the world</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Preview */}
        <View style={styles.previewArea}>
          <Text style={styles.previewEmoji}>📹</Text>
          <Text style={styles.previewText}>Camera Preview</Text>
          <Text style={styles.previewSubtext}>
            Your audience will see you here
          </Text>
        </View>

        {/* Stream Title */}
        <Text style={styles.sectionTitle}>Stream Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What are you streaming today?"
          placeholderTextColor="#666666"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryTitle,
                selectedCategory === category.id && styles.categoryTitleActive,
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Tips */}
        <Text style={styles.sectionTitle}>Live Tips</Text>
        <View style={styles.tipsCard}>
          <Text style={styles.tipItem}>💡 Make sure you have good lighting</Text>
          <Text style={styles.tipItem}>🎤 Check your microphone is working</Text>
          <Text style={styles.tipItem}>📶 Use strong WiFi for best quality</Text>
          <Text style={styles.tipItem}>👋 Greet your viewers when they join</Text>
          <Text style={styles.tipItem}>🎵 Perform your best content</Text>
        </View>

        {/* Go Live Button */}
        <TouchableOpacity
          style={styles.goLiveButton}
          onPress={startLive}>
          <View style={styles.goLiveDot} />
          <Text style={styles.goLiveText}>Start Live Stream</Text>
        </TouchableOpacity>

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
    textShadowColor: '#FF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#FF4444',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 100,
  },
  previewArea: {
    width: '100%',
    height: 200,
    backgroundColor: '#111111',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4444',
    marginBottom: 25,
  },
  previewEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  previewSubtext: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    letterSpacing: 1,
  },
  titleInput: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 25,
  },
  horizontalScroll: {
    paddingBottom: 20,
    paddingRight: 15,
  },
  categoryCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 80,
  },
  categoryCardActive: {
    borderColor: '#FF4444',
    backgroundColor: '#2E0A0A',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryTitle: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  categoryTitleActive: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 25,
    gap: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  goLiveButton: {
    backgroundColor: '#FF4444',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FF6666',
  },
  goLiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  goLiveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  liveContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  cameraArea: {
    height: 280,
    backgroundColor: '#111111',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  liveBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    zIndex: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewerBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  viewerBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timerBadge: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  timerBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  cameraPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  cameraPlaceholderSubtext: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  liveStats: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#333333',
  },
  commentsSection: {
    padding: 15,
    flex: 1,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  commentUser: {
    fontSize: 12,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  commentTime: {
    fontSize: 10,
    color: '#666666',
  },
  reactionsRow: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    gap: 10,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  reactionEmoji: {
    fontSize: 22,
  },
  endLiveButton: {
    margin: 15,
    backgroundColor: '#2E0A0A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  endLiveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4444',
  },
});