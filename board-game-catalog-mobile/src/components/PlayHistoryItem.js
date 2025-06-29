// src/components/PlayHistoryItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlayHistoryItem = ({ play }) => {
  // Format the date for display
  const displayDate = new Date(play.date + 'T00:00:00').toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        {play.rating && <Text style={styles.rating}>Rating: {play.rating}/10</Text>}
      </View>
      {play.players && <Text style={styles.players}>Players: {play.players}</Text>}
      {play.game_state_notes && (
        <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Game State Notes:</Text>
            <Text style={styles.notesText}>{play.game_state_notes}</Text>
        </View>
      )}
      {play.notes && (
         <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Post-Game Notes:</Text>
            <Text style={styles.notesText}>{play.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e67e22',
  },
  players: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 5,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444'
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
});

export default PlayHistoryItem;
