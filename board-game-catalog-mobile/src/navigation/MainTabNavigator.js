// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import all screens
import DashboardScreen from '../screens/Main/DashboardScreen';
import CollectionScreen from '../screens/Main/CollectionScreen';
import WishlistScreen from '../screens/Main/WishlistScreen';
import AddGameScreen from '../screens/Main/AddGameScreen';
import LogPlayScreen from '../screens/Main/LogPlayScreen';
import GameDetailScreen from '../screens/Main/GameDetailScreen';
import AllPlaysScreen from '../screens/Main/AllPlaysScreen';
import DiscoverScreen from '../screens/Main/DiscoverScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- THIS IS THE CORRECTED STACK ---
// The HomeStack now contains the Dashboard AND the screens it needs to navigate to.
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddGame" component={AddGameScreen} options={{ title: 'Add Game' }} />
    <Stack.Screen name="LogPlay" component={LogPlayScreen} options={{ title: 'Log Play' }} />
  </Stack.Navigator>
);

const CollectionStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CollectionList" component={CollectionScreen} options={{ title: 'My Collection' }} />
    <Stack.Screen name="GameDetail" component={GameDetailScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') { iconName = focused ? 'home' : 'home-outline'; }
          else if (route.name === 'Collection') { iconName = focused ? 'library' : 'library-outline'; }
          else if (route.name === 'Wishlist') { iconName = focused ? 'star' : 'star-outline'; }
          else if (route.name === 'Plays') { iconName = focused ? 'time' : 'time-outline'; }
          else if (route.name === 'Discover') { iconName = focused ? 'compass' : 'compass-outline'; }
          else if (route.name === 'Profile') { iconName = focused ? 'person-circle' : 'person-circle-outline'; }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Collection" component={CollectionStack} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Plays" component={AllPlaysScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
