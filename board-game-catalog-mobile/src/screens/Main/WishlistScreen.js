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
      await api.addGameToCollection({ game_id: item.game.bgg_id });
      // The backend now automatically removes the item from the wishlist.
      Alert.alert('Success', `"${item.game.title}" moved to your collection!`);
      fetchWishlist(); // Just refresh the list
    } catch (error) {
       if (error.response?.status === 409) {
        Alert.alert("Already Owned", "This game is already in your collection.");
      } else {
        Alert.alert("Error", "Could not move game to collection.");
      }
    }
  };

  const handleRemoveFromWishlist = (item) => {
    Alert.alert(
      "Remove from Wishlist",
      `Are you sure you want to remove "${item.game.title}" from your wishlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteWishlistEntry(item.id);
              fetchWishlist(); // Refresh the list
            } catch (e) {
              Alert.alert("Error", "Could not remove game from wishlist.");
            }
          },
        },
      ]
    );
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.gameItem}>
      <Text style={styles.gameTitle}>{item.game?.title}</Text>
      <Text style={styles.gameInfo}>{item.game?.year_published}</Text>
      {/* The "Added on" date Text component has been removed */}
      <View style={styles.buttonContainer}>
        <Button title="Move to Collection" onPress={() => handleMoveToCollection(item)} />
        <View style={{ marginLeft: 10 }}>
            <Button title="Remove" onPress={() => handleRemoveFromWishlist(item)} color="#dc3545" />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  gameItem: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginVertical: 5, marginHorizontal: 10 },
  gameTitle: { fontSize: 18, fontWeight: 'bold' },
  gameInfo: { fontSize: 14, color: '#666', marginTop: 5 },
  buttonContainer: { marginTop: 15, flexDirection: 'row', alignSelf: 'flex-start' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});

export default WishlistScreen;
