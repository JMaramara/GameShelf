// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import ROUTES from './routes';

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

// THIS IS THE CORRECTED STACK
// It now contains the Dashboard AND the screens it needs to navigate to.
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name={ROUTES.ADD_GAME} component={AddGameScreen} options={{ title: 'Add Game' }} />
    <Stack.Screen name={ROUTES.LOG_PLAY} component={LogPlayScreen} options={{ title: 'Log Play' }} />
  </Stack.Navigator>
);

const CollectionStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CollectionList" component={CollectionScreen} options={{ title: 'My Collection' }} />
    <Stack.Screen name={ROUTES.GAME_DETAIL} component={GameDetailScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === ROUTES.HOME) { iconName = focused ? 'home' : 'home-outline'; }
          else if (route.name === ROUTES.COLLECTION) { iconName = focused ? 'library' : 'library-outline'; }
          else if (route.name === ROUTES.WISHLIST) { iconName = focused ? 'star' : 'star-outline'; }
          else if (route.name === ROUTES.PLAYS) { iconName = focused ? 'time' : 'time-outline'; }
          else if (route.name === ROUTES.DISCOVER) { iconName = focused ? 'compass' : 'compass-outline'; }
          else if (route.name === ROUTES.PROFILE) { iconName = focused ? 'person-circle' : 'person-circle-outline'; }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeStack} />
      <Tab.Screen name={ROUTES.COLLECTION} component={CollectionStack} />
      <Tab.Screen name={ROUTES.WISHLIST} component={WishlistScreen} />
      <Tab.Screen name={ROUTES.PLAYS} component={AllPlaysScreen} />
      <Tab.Screen name={ROUTES.DISCOVER} component={DiscoverScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
