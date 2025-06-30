// src/screens/Main/DashboardScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import * as api from '../../api/api';

const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={[styles.statValue, { color: color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AppButton = ({ onPress, title, style, textStyle }) => (
    <TouchableOpacity onPress={onPress} style={[styles.appButtonContainer, style]}>
        <Text style={[styles.appButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.getMyStats();
      setStats(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load user statistics.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setIsLoading(true); fetchStats(); }, [fetchStats]));

  const onRefresh = () => { setRefreshing(true); fetchStats(); }

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>GameShelf</Text>
        <View style={styles.statsContainer}>
          <StatCard label="Owned" value={stats ? stats.collection_count : 0} color="#007bff" />
          <StatCard label="Wishlist" value={stats ? stats.wishlist_count : 0} color="#17a2b8" />
          <StatCard label="Plays" value={stats ? stats.plays_count : 0} color="#28a745" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.mainActions}>
            {/* --- THIS IS THE FIX --- */}
            <AppButton title="Add Game" onPress={() => navigation.navigate('AddGame')} style={{backgroundColor: '#5bc0de'}} />
            <AppButton title="Log Play" onPress={() => navigation.navigate('LogPlay')} style={{backgroundColor: '#5cb85c'}} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', paddingTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#495057', paddingHorizontal: 30, marginTop: 30, marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingHorizontal: 10 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', width: '31%', borderWidth: 1, borderColor: '#e9ecef', borderTopWidth: 4, },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#6c757d', marginTop: 5 },
  mainActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, paddingHorizontal: 20 },
  appButtonContainer: { flex: 1, marginHorizontal: 10, paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, },
  appButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
});

export default DashboardScreen;
