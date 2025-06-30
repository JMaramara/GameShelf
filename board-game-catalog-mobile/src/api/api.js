// src/api/api.js
import axios from 'axios';
import AsyncStorage from '../utils/AsyncStorage';

const API_BASE_URL = 'http://192.168.2.14:8000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// --- User Authentication (Your working version) ---
export const registerUser = (email, password) => api.post('/users/register', { email, password });
export const loginUser = (username, password) => api.post('/users/token', { username, password }, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
export const getMyProfile = () => api.get('/users/me');
// This function is needed for the dashboard
export const getMyStats = () => api.get('/users/stats');

// --- Game & Collection ---
export const searchBGG = (query) => api.get(`/games/search-bgg?query=${encodeURIComponent(query)}`);
export const getGameDetails = (bggId) => api.get(`/games/${bggId}`);
export const addGameToCollection = (collectionData) => api.post('/games/collection/', collectionData);
export const getUserCollection = () => api.get('/games/collection/');
export const updateCollectionEntry = (entryId, updates) => api.put(`/games/collection/${entryId}`, updates);
export const deleteCollectionEntry = (entryId) => api.delete(`/games/collection/${entryId}`);

// --- Wishlist ---
export const getUserWishlist = () => api.get('/wishlists/');
export const addGameToWishlist = (wishlistData) => api.post('/wishlists/', wishlistData);
export const deleteWishlistEntry = (entryId) => api.delete(`/wishlists/${entryId}`);
export const updateWishlistEntry = (entryId, updates) => api.put(`/wishlists/${entryId}`, updates);

// --- Play Sessions ---
export const logPlaySession = (bggId, playData) => {
    return api.post('/plays/', {
        bgg_id: bggId,
        ...playData
    });
};
export const getPlayHistoryForGame = (gameId) => {
    return api.get(`/plays/${gameId}`);
}

export const getAllPlays = () => api.get('/plays/');

export default api;
