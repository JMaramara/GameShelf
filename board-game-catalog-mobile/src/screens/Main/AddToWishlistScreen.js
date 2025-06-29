// src/screens/Main/AddToWishlistScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import { searchBGG, addGameToWishlist } from '../../api/api';

const AddToWishlistScreen = ({ navigation }) => { // Pay extreme attention to this line
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null);
    if (searchQuery.length < 2) {
      Alert.alert('Search Error', 'Please enter at least 2 characters for search.');
      return;
    }
    setIsLoadingSearch(true);
    try {
      const response = await searchBGG(searchQuery);
      setSearchResults(response.data);
    } catch (e) {
      console.error('BGG Search Error:', e.response?.data || e.message);
      setError('Failed to search BoardGameGeek. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleAddToWishlist = async (gameId, gameTitle) => {
    setIsAddingGame(true);
    setError(null);
    try {
      await addGameToWishlist(gameId, 1, '');
      Alert.alert('Success', `${gameTitle} added to your wishlist!`);
      navigation.goBack();
    } catch (e) {
      console.error('Add Game to Wishlist Error:', e.response?.data || e.message);
      const errorMessage = e.response?.data?.detail || 'Failed to add game to wishlist.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAddingGame(false);
    }
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity style={styles.gameItem} onPress={() => handleAddToWishlist(item.bgg_id, item.title)} disabled={isAddingGame}>
      <Image source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/150' }} style={styles.thumbnail} />
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{item.title}</Text>
        {item.year_published && <Text style={styles.gameDetail}>Year: {item.year_published}</Text>}
        {item.publisher && <Text style={styles.gameDetail}>Publisher: {item.publisher}</Text>}
        {item.bgg_rating && <Text style={styles.gameDetail}>BGG Rating: {parseFloat(item.bgg_rating).toFixed(2)}</Text>}
      </View>
      {isAddingGame && <ActivityIndicator size="small" color="#0000ff" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Add Game to Wishlist</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by game title (e.g., Everdell, Gloomhaven)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <Button title={isLoadingSearch ? "Searching..." : "Search BoardGameGeek"} onPress={handleSearch} disabled={isLoadingSearch || isAddingGame} />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoadingSearch && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}

      {!isLoadingSearch && searchResults.length === 0 && searchQuery.length > 0 && !error && (
        <Text style={styles.noResultsText}>No games found for "{searchQuery}". Try a different query.</Text>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.bgg_id.toString()}
        renderItem={renderGameItem}
        style={styles.resultsList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  spinner: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  resultsList: {
    marginTop: 20,
  },
  gameItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameDetail: {
    fontSize: 14,
    color: '#555',
  },
});

export default AddToWishlistScreen;
