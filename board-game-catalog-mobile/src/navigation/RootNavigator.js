// src/navigation/RootNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
// --- REMOVE THE OLD APP STACK ---
// import AppStack from './AppStack'; 
// --- IMPORT THE NEW TAB NAVIGATOR ---
import MainTabNavigator from './MainTabNavigator'; 
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const RootNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* --- USE THE NEW TAB NAVIGATOR WHEN LOGGED IN --- */}
      {userToken ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
