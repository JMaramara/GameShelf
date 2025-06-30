// src/screens/Main/CollectionScreen.js
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getUserCollection, deleteCollectionEntry } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';

const CollectionScreen = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUserCollection();
      setCollection(response.data);
    } catch (e) {
      Alert.alert("Error", "Could not load collection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { if (userToken) { fetchCollection(); } }, [userToken, fetchCollection]));
  
  const handleDeleteOwnedGame = (entryId, gameTitle) => { /* unchanged */ };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => navigation.navigate('GameDetail', { collectionEntry: item })}
    >
      <Text style={styles.gameTitle}>{item.game?.title || 'Unknown Title'}</Text>
      <Text style={styles.gameInfo}>{item.game?.year_published}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={(e) => { e.stopPropagation(); handleDeleteOwnedGame(item.id, item.game?.title); }}>
        <Text style={styles.removeButtonText}>REMOVE</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>; }

  return (
    <View style={styles.container}>
      <FlatList
        data={collection}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGameItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Your collection is empty. Go to the "Add Game" tab to add some!</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameItem: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginVertical: 5, marginHorizontal: 10, },
  gameTitle: { fontSize: 18, fontWeight: 'bold' },
  gameInfo: { fontSize: 14, color: '#666', marginTop: 5 },
  removeButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5, marginTop: 10, alignSelf: 'flex-start' },
  removeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});

export default CollectionScreen;
