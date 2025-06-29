// src/screens/Main/LogPlayScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native';
import * as api from '../../api/api';
import LogPlayModal from './LogPlayModal';

const LogPlayScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      Alert.alert('Search too short', 'Please enter at least 3 characters.');
      return;
    }
    setIsLoading(true);
    setSearchResults([]);
    try {
      const response = await api.searchBGG(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not perform search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleSavePlay = async (playData) => {
    if (!selectedGame) return;
    try {
      await api.logPlaySession(selectedGame.bgg_id, playData);
      Alert.alert('Success', `Play session for ${selectedGame.title} logged successfully!`);
      setModalVisible(false);
      setSelectedGame(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Error', 'Could not log the play session.');
    }
  };

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectGame(item)}>
      <Text style={styles.resultTitle}>{item.title} ({item.year_published})</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log a Play</Text>
      <Text style={styles.instructions}>Search for the game you played:</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="e.g., Wingspan, Catan..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <Button title="Search Games" onPress={handleSearch} />
      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.bgg_id.toString()}
        renderItem={renderSearchResultItem}
        style={{ marginTop: 20 }}
      />
      {selectedGame && (
          <LogPlayModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleSavePlay}
            gameTitle={selectedGame.title}
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  instructions: { textAlign: 'center', color: '#666', marginBottom: 20 },
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, backgroundColor: '#fff' },
  resultItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  resultTitle: { fontSize: 16, fontWeight: '500' },
});

export default LogPlayScreen;
