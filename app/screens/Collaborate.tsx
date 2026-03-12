import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const onlineCreators = [
  { id: '1', emoji: '🎤', name: 'VocalQueen', skill: 'Singer', status: 'online' },
  { id: '2', emoji: '🥁', name: 'BeatKing254', skill: 'Producer', status: 'online' },
  { id: '3', emoji: '🎸', name: 'GuitarHero', skill: 'Guitarist', status: 'online' },
  { id: '4', emoji: '🎹', name: 'PianoMaster', skill: 'Pianist', status: 'away' },
  { id: '5', emoji: '🎬', name: 'Director_KE', skill: 'Filmmaker', status: 'online' },
  { id: '6', emoji: '🎵', name: 'HarmonyKing', skill: 'Composer', status: 'away' },
];

const collaborationTypes = [
  { id: '1', emoji: '🎵', title: 'Music Collab', subtitle: 'Create music together' },
  { id: '2', emoji: '🎬', title: 'Video Collab', subtitle: 'Film together' },
  { id: '3', emoji: '🎤', title: 'Vocal Collab', subtitle: 'Sing together' },
  { id: '4', emoji: '🥁', title: 'Beat Collab', subtitle: 'Make beats together' },
  { id: '5', emoji: '📱', title: 'Reel Collab', subtitle: 'Create reels together' },
  { id: '6', emoji: '🔴', title: 'Live Together', subtitle: 'Go live together' },
];

export default function CollaborateScreen() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  function sendInvite(creatorId: string) {
    setInviteSent(creatorId);
    setTimeout(() => setInviteSent(null), 3000);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤝 Collaborate</Text>
        <Text style={styles.subtitle}>Create amazing things together</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators to collaborate with..."
            placeholderTextColor="#666666"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Collaboration Types */}
        <Text style={styles.sectionTitle}>Type of Collaboration</Text>
        <View style={styles.typesGrid}>
          {collaborationTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedType === type.id && styles.typeCardActive,
              ]}
              onPress={() => setSelectedType(type.id)}>
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.typeTitle,
                selectedType === type.id && styles.typeTitleActive,
              ]}>
                {type.title}
              </Text>
              <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Online Creators */}
        <Text style={styles.sectionTitle}>🟢 Online Creators</Text>
        {onlineCreators.map(creator => (
          <View key={creator.id} style={styles.creatorCard}>
            <View style={styles.creatorLeft}>
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorEmoji}>{creator.emoji}</Text>
                <View style={[
                  styles.statusDot,
                  creator.status === 'online' ? styles.statusOnline : styles.statusAway,
                ]} />
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorSkill}>{creator.skill}</Text>
                <Text style={[
                  styles.creatorStatus,
                  creator.status === 'online' ? styles.statusTextOnline : styles.statusTextAway,
                ]}>
                  {creator.status === 'online' ? '🟢 Online now' : '🟡 Away'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.inviteButton,
                inviteSent === creator.id && styles.inviteButtonSent,
              ]}
              onPress={() => sendInvite(creator.id)}>
              <Text style={styles.inviteButtonText}>
                {inviteSent === creator.id ? '✅ Sent' : '+ Invite'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Create Room Button */}
        <TouchableOpacity style={styles.createRoomButton}>
          <Text style={styles.createRoomEmoji}>🎙️</Text>
          <Text style={styles.createRoomText}>Create Collab Room</Text>
          <Text style={styles.createRoomSubtext}>
            Invite up to 4 creators to create together
          </Text>
        </TouchableOpacity>

        {/* Share Invite Link */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareEmoji}>🔗</Text>
          <Text style={styles.shareText}>Share Invite Link</Text>
          <Text style={styles.shareSubtext}>
            Share a link with anyone to collaborate
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 25,
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
  sectionTitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 15,
    letterSpacing: 1,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  typeCard: {
    width: (width - 45) / 2,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  typeCardActive: {
    borderColor: '#C77DFF',
    backgroundColor: '#1A0A2E',
  },
  typeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeTitleActive: {
    color: '#C77DFF',
  },
  typeSubtitle: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  creatorCard: {
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
  creatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#C77DFF',
  },
  creatorEmoji: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#111111',
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusAway: {
    backgroundColor: '#FFD700',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  creatorSkill: {
    fontSize: 12,
    color: '#9D4EDD',
    marginBottom: 2,
  },
  creatorStatus: {
    fontSize: 11,
  },
  statusTextOnline: {
    color: '#4CAF50',
  },
  statusTextAway: {
    color: '#FFD700',
  },
  inviteButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C77DFF',
  },
  inviteButtonSent: {
    backgroundColor: '#1A2E0A',
    borderColor: '#4CAF50',
  },
  inviteButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createRoomButton: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C77DFF',
    marginTop: 10,
  },
  createRoomEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  createRoomText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createRoomSubtext: {
    fontSize: 12,
    color: '#E0AAFF',
    textAlign: 'center',
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
    textAlign: 'center',
  },
});