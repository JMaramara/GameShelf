// src/screens/Main/AllPlaysScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../api/api';
import PlayHistoryItem from '../../components/PlayHistoryItem';

const AllPlaysScreen = () => {
  const [groupedPlays, setGroupedPlays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  const fetchAllPlays = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllPlays();
      // Process the flat list into a grouped structure for the SectionList
      const groups = response.data.reduce((acc, play) => {
        const title = play.game.title;
        if (!acc[title]) {
          acc[title] = [];
        }
        acc[title].push(play);
        return acc;
      }, {});

      const sections = Object.keys(groups).map(title => ({
        title: title,
        data: groups[title],
      }));
      setGroupedPlays(sections);

    } catch (error) {
      Alert.alert("Error", "Could not load play history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAllPlays(); }, [fetchAllPlays]));

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderSectionHeader = ({ section: { title, data } }) => (
    <TouchableOpacity onPress={() => toggleSection(title)} style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title} ({data.length} plays)</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, section }) => {
    if (!expandedSections[section.title]) {
      return null; // Don't render items in collapsed sections
    }
    return <PlayHistoryItem play={item} />;
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedPlays}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={<Text style={styles.title}>All Plays</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't logged any plays yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  sectionHeader: {
    backgroundColor: '#007bff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});

export default AllPlaysScreen;
