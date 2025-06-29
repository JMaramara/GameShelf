// src/screens/Main/WishlistScreen.js
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getUserWishlist, deleteWishlistEntry, addGameToCollection } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';

const WishlistScreen = ({ navigation }) => { // Pay extreme attention to this line
  const { userToken } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setIsLoadingWishlist(true);
    setError(null);
    try {
      const response = await getUserWishlist();
      setWishlist(response.data);
    } catch (e) {
      console.error('Failed to fetch wishlist:', e.response?.data || e.message);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        fetchWishlist();
      }
    }, [userToken])
  );

  const handleDeleteWishlistEntry = async (entryId, gameTitle) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove "${gameTitle}" from your wishlist?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteWishlistEntry(entryId);
              Alert.alert('Success', `${gameTitle} removed from wishlist.`);
              fetchWishlist();
            } catch (e) {
              console.error('Error deleting wishlist entry:', e.response?.data || e.message);
              Alert.alert('Error', e.response?.data?.detail || 'Failed to remove game from wishlist.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleMoveToCollection = async (wishlistEntryId, gameBggId, gameTitle) => {
    Alert.alert(
      "Move to Collection",
      `Are you sure you want to move "${gameTitle}" to your owned collection?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Move",
          onPress: async () => {
            try {
              await addGameToCollection(gameBggId, '', '');
              await deleteWishlistEntry(wishlistEntryId);
              Alert.alert('Success', `${gameTitle} moved to your collection and removed from wishlist!`);
              fetchWishlist();
            } catch (e) {
              console.error('Error moving to collection:', e.response?.data || e.message);
              Alert.alert('Error', e.response?.data?.detail || 'Failed to move game to collection.');
            }
          }
        }
      ]
    );
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.wishlistItem}>
      <Image source={{ uri: item.game?.thumbnail_url || 'https://via.placeholder.com/100' }} style={styles.thumbnail} />
      <View style={styles.wishlistInfo}>
        <Text style={styles.gameTitle}>{item.game?.title || 'Unknown Title'}</Text>
        {item.priority && <Text style={styles.gameDetail}>Priority: {item.priority}</Text>}
        {item.notes && <Text style={styles.gameDetail}>Notes: {item.notes}</Text>}
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Move to Owned" onPress={() => handleMoveToCollection(item.id, item.game.bgg_id, item.game?.title)} />
        <Button title="Delete" onPress={() => handleDeleteWishlistEntry(item.id, item.game?.title)} color="red" />
      </View>
    </View>
  );

  if (isLoadingWishlist) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Wishlist...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchWishlist} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Wishlist</Text>
      <Button title="Add to Wishlist" onPress={() => navigation.navigate('AddToWishlist')} />
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWishlistItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Your wishlist is empty. Add some games!</Text>}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  wishlistItem: {
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
    width: 70,
    height: 70,
    borderRadius: 4,
    marginRight: 15,
  },
  wishlistInfo: {
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
  buttonsContainer: {
    marginLeft: 10,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 70,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});

export default WishlistScreen;
