// src/screens/Main/AddGameScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native';
import { searchBGG, addGameToCollection } from '../../api/api';
import { AuthContext } from '../../context/AuthContext'; // To potentially trigger collection refresh

const AddGameScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState(null);
  const { userToken } = useContext(AuthContext); // Used implicitly by API calls but useful for context

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
      setSearchResults([]); // Clear previous results on error
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleAddGame = async (gameId, gameTitle) => {
    setIsAddingGame(true);
    setError(null);
    try {
      await addGameToCollection(gameId, '', ''); // Add with empty notes/tags for now
      Alert.alert('Success', `${gameTitle} added to your collection!`);
      // Optionally navigate back or refresh collection screen
      navigation.goBack(); // Go back to collection screen
    } catch (e) {
      console.error('Add Game to Collection Error:', e.response?.data || e.message);
      const errorMessage = e.response?.data?.detail || 'Failed to add game to collection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAddingGame(false);
    }
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity style={styles.gameItem} onPress={() => handleAddGame(item.bgg_id, item.title)} disabled={isAddingGame}>
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
      <Text style={styles.screenTitle}>Add a Board Game</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by game title (e.g., Catan, Wingspan)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch} // Trigger search on keyboard "done"
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

export default AddGameScreen;
