// src/screens/Main/CollectionScreen.js
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getUserCollection } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';
import ROUTES from '../../navigation/routes';

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

  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        fetchCollection();
      }
    }, [userToken, fetchCollection])
  );

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gameItem}
      onPress={() => navigation.navigate(ROUTES.GAME_DETAIL, { collectionEntry: item })}
    >
      <View style={styles.gameInfoContainer}>
        <Text style={styles.gameTitle}>{item.game?.title || 'Unknown Title'}</Text>
        <Text style={styles.gameInfo}>{item.game?.year_published}</Text>
        {item.for_sale_trade && <Text style={styles.forSaleTradeText}>FOR SALE/TRADE!</Text>}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collection}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGameItem}
        ListHeaderComponent={<Text style={styles.title}>My Collection</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Your collection is empty.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  gameItem: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 8, 
    marginVertical: 5, 
    marginHorizontal: 10,
  },
  gameInfoContainer: {
    flex: 1,
  },
  gameTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    flexShrink: 1 
  },
  gameInfo: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16, 
    color: '#888' 
  },
  forSaleTradeText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#28a745', 
    marginTop: 5 
  },
});

export default CollectionScreen;
