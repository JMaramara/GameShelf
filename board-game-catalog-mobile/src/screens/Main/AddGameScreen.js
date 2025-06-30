// src/screens/Main/AddGameScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, Button } from 'react-native';
import * as api from '../../api/api';

const AddGameScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      Alert.alert('Search too short', 'Please enter at least 2 characters.');
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
    Alert.alert(
      `Add "${game.title}"`,
      "Where would you like to add this game?",
      [
        {
          text: 'Add to Collection',
          onPress: async () => {
            try {
              // The backend expects game_id to be the bgg_id for this call
              await api.addGameToCollection({ game_id: game.bgg_id });
              Alert.alert('Success', `${game.title} added to your collection!`);
              navigation.navigate('Collection');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.detail || 'Could not add to collection.');
            }
          },
        },
        {
          text: 'Add to Wishlist',
          onPress: async () => {
             try {
              // The backend expects game_id to be the bgg_id for this call
              await api.addGameToWishlist({ game_id: game.bgg_id });
              Alert.alert('Success', `${game.title} added to your wishlist!`);
              navigation.navigate('Wishlist');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.detail || 'Could not add to wishlist.');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectGame(item)}>
      <Text style={styles.resultTitle}>{item.title} ({item.year_published})</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Search for a game to add</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="e.g., Everdell, Ark Nova..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <Button title="Search Games" onPress={handleSearch} />
      {isLoading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.bgg_id.toString()}
        renderItem={renderSearchResultItem}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  instructions: { textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 15 },
  searchInput: { height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, backgroundColor: '#fff', fontSize: 16 },
  resultItem: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  resultTitle: { fontSize: 16, fontWeight: '500' },
});

export default AddGameScreen;
