// src/screens/Main/CollectionScreen.js
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getUserCollection, deleteCollectionEntry } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';

const CollectionScreen = ({ navigation }) => {
  // This line is now restored to correctly get the logout function
  const { logout, userToken } = useContext(AuthContext); 
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserCollection();
      setCollection(response.data);
    } catch (e) {
      setError('Failed to load collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        fetchCollection();
      }
    }, [userToken])
  );

  const handleDeleteOwnedGame = (entryId, gameTitle) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove "${gameTitle}" from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              await deleteCollectionEntry(entryId);
              fetchCollection();
            } catch (e) {
              Alert.alert('Error', 'Failed to remove game from collection.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => navigation.navigate('GameDetail', { collectionEntry: item })}
    >
      <Text style={styles.gameTitle}>{item.game?.title || 'Unknown Title'}</Text>
      <Text style={styles.gameInfo}>Players: {item.game?.min_players}-{item.game?.max_players}</Text>
      <Text style={styles.gameInfo}>Playing Time: {item.game?.playing_time_min}-{item.game?.playing_time_max} min</Text>
      
      {item.for_sale_trade && <Text style={styles.forSaleTradeText}>FOR SALE/TRADE!</Text>}
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDeleteOwnedGame(item.id, item.game?.title);
        }}
      >
        <Text style={styles.removeButtonText}>REMOVE</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading Collection...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchCollection} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Collection</Text>
      <View style={styles.buttonRow}>
        <Button title="Add New Game" onPress={() => navigation.navigate('AddGame')} />
        <Button title="Log a Play" onPress={() => navigation.navigate('LogPlay')} />
        <Button title="Go to Wishlist" onPress={() => navigation.navigate('Wishlist')} />
      </View>
      <FlatList
        data={collection}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGameItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Your collection is empty.</Text>}
        contentContainerStyle={{ paddingTop: 10 }}
      />
      <View style={styles.logoutButton}>
         <Button title="Logout" onPress={logout} color="#6c757d" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 15, textAlign: 'center' },
  gameItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginHorizontal: 5, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  gameTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  gameInfo: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  removeButton: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginTop: 10, alignSelf: 'flex-start' },
  removeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  logoutButton: { margin: 10 },
  forSaleTradeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
});

export default CollectionScreen;
