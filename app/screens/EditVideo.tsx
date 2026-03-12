import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const tools = [
  { id: '1', emoji: '✂️', title: 'Trim', subtitle: 'Cut your video' },
  { id: '2', emoji: '🔄', title: 'Rotate', subtitle: 'Rotate your video' },
  { id: '3', emoji: '🎨', title: 'Color', subtitle: 'Adjust colors' },
  { id: '4', emoji: '✨', title: 'Filter', subtitle: 'Add filters' },
  { id: '5', emoji: '🔊', title: 'Audio', subtitle: 'Edit audio' },
  { id: '6', emoji: '📝', title: 'Text', subtitle: 'Add text' },
  { id: '7', emoji: '😀', title: 'Stickers', subtitle: 'Add stickers' },
  { id: '8', emoji: '🎵', title: 'Music', subtitle: 'Add background music' },
  { id: '9', emoji: '⚡', title: 'Speed', subtitle: 'Change speed' },
  { id: '10', emoji: '🌟', title: 'Effects', subtitle: 'Add effects' },
];

const filters = [
  { id: '1', emoji: '📷', title: 'Normal', color: '#333333' },
  { id: '2', emoji: '🌅', title: 'Warm', color: '#8B4513' },
  { id: '3', emoji: '🌊', title: 'Cool', color: '#1A4A8A' },
  { id: '4', emoji: '⚫', title: 'Dark', color: '#111111' },
  { id: '5', emoji: '🌈', title: 'Vivid', color: '#8B008B' },
  { id: '6', emoji: '✨', title: 'Glam', color: '#7B2FBE' },
];

const speeds = [
  { id: '1', title: '0.3x', label: 'Slow Mo' },
  { id: '2', title: '0.5x', label: 'Slow' },
  { id: '3', title: '1x', label: 'Normal' },
  { id: '4', title: '1.5x', label: 'Fast' },
  { id: '5', title: '2x', label: 'Faster' },
  { id: '6', title: '3x', label: 'Fastest' },
];

export default function EditVideoScreen() {
  const [selectedTool, setSelectedTool] = useState('1');
  const [selectedFilter, setSelectedFilter] = useState('1');
  const [selectedSpeed, setSelectedSpeed] = useState('3');
  const [brightness, setBrightness] = useState(5);
  const [contrast, setContrast] = useState(5);
  const [volume, setVolume] = useState(8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✂️ Edit Video</Text>
        <Text style={styles.subtitle}>Make your video perfect</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Video Preview Area */}
        <View style={styles.videoPreview}>
          <Text style={styles.videoPreviewEmoji}>🎬</Text>
          <Text style={styles.videoPreviewText}>Your Video Preview</Text>
          <Text style={styles.videoPreviewSubtext}>
            Record a video first then edit it here
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineBar}>
            <View style={styles.timelineProgress} />
            <View style={styles.timelineHandle} />
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>0:00</Text>
            <Text style={styles.timelineLabel}>0:15</Text>
            <Text style={styles.timelineLabel}>0:30</Text>
            <Text style={styles.timelineLabel}>0:45</Text>
            <Text style={styles.timelineLabel}>1:00</Text>
          </View>
        </View>

        {/* Tools Grid */}
        <Text style={styles.sectionTitle}>Editing Tools</Text>
        <View style={styles.toolsGrid}>
          {tools.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolCard,
                selectedTool === tool.id && styles.toolCardActive,
              ]}
              onPress={() => setSelectedTool(tool.id)}>
              <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              <Text style={[
                styles.toolTitle,
                selectedTool === tool.id && styles.toolTitleActive,
              ]}>
                {tool.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filters */}
        <Text style={styles.sectionTitle}>Filters</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterCard,
                selectedFilter === filter.id && styles.filterCardActive,
                { borderColor: filter.color },
              ]}
              onPress={() => setSelectedFilter(filter.id)}>
              <View style={[styles.filterPreview, { backgroundColor: filter.color }]}>
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              </View>
              <Text style={[
                styles.filterTitle,
                selectedFilter === filter.id && styles.filterTitleActive,
              ]}>
                {filter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Speed Control */}
        <Text style={styles.sectionTitle}>Video Speed</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}>
          {speeds.map(speed => (
            <TouchableOpacity
              key={speed.id}
              style={[
                styles.speedCard,
                selectedSpeed === speed.id && styles.speedCardActive,
              ]}
              onPress={() => setSelectedSpeed(speed.id)}>
              <Text style={[
                styles.speedTitle,
                selectedSpeed === speed.id && styles.speedTitleActive,
              ]}>
                {speed.title}
              </Text>
              <Text style={styles.speedLabel}>{speed.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Adjustments */}
        <Text style={styles.sectionTitle}>Adjustments</Text>
        <View style={styles.adjustmentCard}>

          {/* Brightness */}
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>☀️ Brightness</Text>
            <View style={styles.adjustmentControls}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setBrightness(Math.max(0, brightness - 1))}>
                <Text style={styles.adjustButtonText}>－</Text>
              </TouchableOpacity>
              <View style={styles.adjustBar}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.adjustBarSegment,
                      i < brightness && styles.adjustBarSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setBrightness(Math.min(10, brightness + 1))}>
                <Text style={styles.adjustButtonText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contrast */}
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>🌗 Contrast</Text>
            <View style={styles.adjustmentControls}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setContrast(Math.max(0, contrast - 1))}>
                <Text style={styles.adjustButtonText}>－</Text>
              </TouchableOpacity>
              <View style={styles.adjustBar}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.adjustBarSegment,
                      i < contrast && styles.adjustBarSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setContrast(Math.min(10, contrast + 1))}>
                <Text style={styles.adjustButtonText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Volume */}
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentLabel}>🔊 Volume</Text>
            <View style={styles.adjustmentControls}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setVolume(Math.max(0, volume - 1))}>
                <Text style={styles.adjustButtonText}>－</Text>
              </TouchableOpacity>
              <View style={styles.adjustBar}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.adjustBarSegment,
                      i < volume && styles.adjustBarSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setVolume(Math.min(10, volume + 1))}>
                <Text style={styles.adjustButtonText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportEmoji}>📤</Text>
          <Text style={styles.exportText}>Export Video</Text>
          <Text style={styles.exportSubtext}>Save your edited video</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareEmoji}>📱</Text>
          <Text style={styles.shareText}>Share As Reel</Text>
          <Text style={styles.shareSubtext}>Post to SmartVerse feed</Text>
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
    paddingBottom: 100,
  },
  videoPreview: {
    width: '100%',
    height: 180,
    backgroundColor: '#111111',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7B2FBE',
    marginBottom: 15,
  },
  videoPreviewEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  videoPreviewSubtext: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  timeline: {
    marginBottom: 25,
  },
  timelineBar: {
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'relative',
  },
  timelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: '#7B2FBE',
    opacity: 0.6,
  },
  timelineHandle: {
    position: 'absolute',
    left: '40%',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#C77DFF',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineLabel: {
    fontSize: 10,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    letterSpacing: 1,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  toolCard: {
    width: (width - 55) / 5,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  toolCardActive: {
    borderColor: '#C77DFF',
    backgroundColor: '#1A0A2E',
  },
  toolEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  toolTitleActive: {
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  horizontalScroll: {
    paddingBottom: 20,
    paddingRight: 15,
  },
  filterCard: {
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#111111',
  },
  filterCardActive: {
    backgroundColor: '#1A0A2E',
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  filterEmoji: {
    fontSize: 24,
  },
  filterTitle: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  filterTitleActive: {
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  speedCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 70,
  },
  speedCardActive: {
    borderColor: '#C77DFF',
    backgroundColor: '#1A0A2E',
  },
  speedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AAAAAA',
    marginBottom: 4,
  },
  speedTitleActive: {
    color: '#C77DFF',
  },
  speedLabel: {
    fontSize: 10,
    color: '#666666',
  },
  adjustmentCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 25,
    gap: 15,
  },
  adjustmentRow: {
    gap: 8,
  },
  adjustmentLabel: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 5,
  },
  adjustmentControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2FBE',
  },
  adjustButtonText: {
    fontSize: 18,
    color: '#C77DFF',
    fontWeight: 'bold',
  },
  adjustBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  adjustBarSegment: {
    flex: 1,
    height: 20,
    borderRadius: 3,
    backgroundColor: '#333333',
  },
  adjustBarSegmentActive: {
    backgroundColor: '#7B2FBE',
  },
  exportButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  exportEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  exportText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exportSubtext: {
    fontSize: 12,
    color: '#E0AAFF',
  },
  shareButton: {
    backgroundColor: '#1A0A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  shareEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  shareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 4,
  },
  shareSubtext: {
    fontSize: 12,
    color: '#9D4EDD',
  },
});