// src/screens/Main/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { logout } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text>User settings and stats will go here.</Text>
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={logout} color="#dc3545" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  logoutButton: { marginTop: 30, width: '60%' }
});

export default ProfileScreen;
