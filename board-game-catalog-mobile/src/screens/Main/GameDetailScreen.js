// src/screens/Main/GameDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../api/api';
import PlayHistoryItem from '../../components/PlayHistoryItem';

const GameDetailScreen = ({ route, navigation }) => {
  const { collectionEntry } = route.params;
  const game = collectionEntry?.game || {};

  const [personalNotes, setPersonalNotes] = useState(collectionEntry.personal_notes || '');
  const [customTags, setCustomTags] = useState(collectionEntry.custom_tags || '');
  const [playHistory, setPlayHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchPlayHistory = async () => {
    if (!game.id) return;
    setIsLoadingHistory(true);
    try {
      const response = await api.getPlayHistoryForGame(game.id);
      setPlayHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch play history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPlayHistory(); }, [game.id]));

  const handleSaveChanges = async () => {
    try {
      const updates = {
        personal_notes: personalNotes,
        custom_tags: customTags,
      };
      await api.updateCollectionEntry(collectionEntry.id, updates);
      Alert.alert('Success', 'Notes and tags have been saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save notes and tags.');
    }
  };

  // --- THIS FUNCTION IS NOW RESTORED ---
  const handleDeleteGame = async () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove "${game.title}" from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteCollectionEntry(collectionEntry.id);
              Alert.alert('Success', `${game.title} has been removed from your collection.`);
              navigation.goBack(); // Go back to the collection list
            } catch (e) {
              Alert.alert('Error', 'Failed to remove game.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.gameTitle}>{game.title || 'Game Title'}</Text>
      
      <Image
        style={styles.boxArt}
        source={{ uri: game.box_art_url || game.thumbnail_url }}
        resizeMode="contain"
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Play History</Text>
        {isLoadingHistory ? <ActivityIndicator /> : 
          playHistory.length > 0 ? 
          playHistory.map(play => <PlayHistoryItem key={play.id} play={play} />) : 
          <Text style={styles.noHistoryText}>No plays logged for this game yet.</Text>
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Notes</Text>
        <TextInput
          style={styles.multilineInput}
          value={personalNotes}
          onChangeText={setPersonalNotes}
          placeholder="Add your notes here..."
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Tags</Text>
        <TextInput
          style={styles.textInput}
          value={customTags}
          onChangeText={setCustomTags}
          placeholder="e.g., solo, party, campaign"
        />
      </View>
      
      <View style={styles.buttonGroup}>
        <Button title="Save Notes & Tags" onPress={handleSaveChanges} />
        {/* The onPress for this button is now correctly wired */}
        <Button title="Remove from Collection" onPress={handleDeleteGame} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    scrollViewContent: { paddingBottom: 40, backgroundColor: '#f5f5f5' },
    gameTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 10, paddingHorizontal: 10 },
    boxArt: { width: '100%', height: 250, resizeMode: 'contain', marginBottom: 20, backgroundColor: '#fff' },
    section: { backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    textInput: { height: 40, borderColor: '#ddd', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, fontSize: 16 },
    multilineInput: { minHeight: 100, borderColor: '#ddd', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, textAlignVertical: 'top', fontSize: 16 },
    buttonGroup: { gap: 10, marginHorizontal: 20, marginTop: 20 },
    noHistoryText: { textAlign: 'center', fontStyle: 'italic', color: '#666', paddingVertical: 10 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default GameDetailScreen;
