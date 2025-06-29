// src/api/api.js

import axios from 'axios';

import AsyncStorage from '../utils/AsyncStorage'; // Using your existing import path



// IMPORTANT: Update this with your Mac's hotspot IP address!

const API_BASE_URL = 'http://192.168.2.14:8000'; // YOUR MAC'S HOTSPOT IP



const api = axios.create({

  baseURL: API_BASE_URL,

  headers: {

    'Content-Type': 'application/json',

  },

});



// Interceptor to attach JWT token to requests

api.interceptors.request.use(

  async (config) => {

    const token = await AsyncStorage.getItem('userToken');

    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);



// User Authentication

export const registerUser = (email, password) => api.post('/users/register', { email, password });

export const loginUser = (username, password) => api.post('/users/token', { username, password }, {

  headers: {

    'Content-Type': 'application/x-www-form-urlencoded',

  },

});

export const getMyProfile = () => api.get('/users/me');



// Game & Collection

export const searchBGG = (query) => api.get(`/games/search-bgg?query=${query}`);

export const getGameDetails = (bggId) => api.get(`/games/${bggId}`);

export const addGameToCollection = (gameId, personalNotes, customTags) =>

  api.post('/games/collection/', { game_id: gameId, personal_notes: personalNotes, custom_tags: customTags });

export const getUserCollection = () => api.get('/games/collection/');

export const updateCollectionEntry = (entryId, updates) => {
  console.log(`[FRONTEND LOG] Sending PUT request for entry ${entryId} with data:`, JSON.stringify(updates, null, 2));
  return api.put(`/games/collection/${entryId}`, updates);
};

export const deleteCollectionEntry = (entryId) => api.delete(`/games/collection/${entryId}`);

export const barcodeLookup = (barcode) => api.post('/games/barcode-lookup', null, { params: { barcode } });

export const associateBarcode = (barcode, bggId) => api.post('/games/barcode-associate', null, { params: { barcode, bgg_id: bggId } });



// Wishlist

export const getUserWishlist = () => api.get('/wishlists/');

export const addGameToWishlist = (gameId, priority, notes) => api.post('/wishlists/', { game_id: gameId, priority: priority, notes: notes });

export const deleteWishlistEntry = (entryId) => api.delete(`/wishlists/${entryId}`);

export const updateWishlistEntry = (entryId, updates) => api.put(`/wishlists/${entryId}`, updates);



// --- NEW: Play Sessions ---

export const logPlaySession = (bggId, playData) => {

    return api.post('/plays/', {

        bgg_id: bggId,

        ...playData

    });

};



export const getPlayHistoryForGame = (gameId) => {

    // Note: This endpoint expects our internal database game_id, not the bgg_id

    return api.get(`/plays/${gameId}`);

}

export default api;
