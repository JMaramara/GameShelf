// src/navigation/AppStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CollectionScreen from '../screens/Main/CollectionScreen';
// Import other main screens as you create them
import AddGameScreen from '../screens/Main/AddGameScreen';
import WishlistScreen from '../screens/Main/WishlistScreen'; // ADD THIS LINE
import AddToWishlistScreen from '../screens/Main/AddToWishlistScreen'; // ADD THIS LINE
import GameDetailScreen from '../screens/Main/GameDetailScreen'; // ADD THIS LINE

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Collection" component={CollectionScreen} options={{ title: 'My Collection' }} />
      {/* Add other main app screens here */}
      <Stack.Screen name="AddGame" component={AddGameScreen} options={{ title: 'Add Game' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'My Wishlist' }} />
      <Stack.Screen name="AddToWishlist" component={AddToWishlistScreen} options={{ title: 'Add to Wishlist' }} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: 'Game Details' }} />
    </Stack.Navigator>
  );
};

export default AppStack;
