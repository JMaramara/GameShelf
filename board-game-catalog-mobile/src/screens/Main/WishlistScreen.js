// src/screens/Main/WishlistScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import * as api from '../../api/api';

const WishlistScreen = ({ navigation }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getUserWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      Alert.alert("Error", "Could not load your wishlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        fetchWishlist();
      }
    }, [userToken, fetchWishlist])
  );

  const handleMoveToCollection = async (item) => {
    try {
      // --- THIS IS THE FIX ---
      // We now pass an object to the API function, as required
      await api.addGameToCollection({ game_id: item.game.bgg_id });
      // After adding to collection, remove from wishlist
      await api.deleteWishlistEntry(item.id);
      Alert.alert('Success', `"${item.game.title}" moved to your collection!`);
      // Refresh the wishlist
      fetchWishlist();
    } catch (error) {
      console.error("Error moving to collection:", error.response?.data || error);
       if (error.response?.status === 409) {
        Alert.alert("Already Owned", "This game is already in your collection.");
      } else {
        Alert.alert("Error", "Could not move game to collection.");
      }
    }
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.gameItem}>
      <Text style={styles.gameTitle}>{item.game?.title}</Text>
      <Text style={styles.gameInfo}>Added on: {new Date(item.added_date).toLocaleDateString()}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Move to Collection" onPress={() => handleMoveToCollection(item)} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWishlistItem}
        ListHeaderComponent={<Text style={styles.title}>My Wishlist</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Your wishlist is empty.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  gameItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default WishlistScreen;
