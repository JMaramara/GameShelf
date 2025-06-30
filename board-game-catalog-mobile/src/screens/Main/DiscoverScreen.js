// src/screens/Main/DiscoverScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover & Add-ons</Text>
      <Text>The First Player Randomizer and other utilities will live here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
});

export default DiscoverScreen;
