// src/api/api.js
import axios from 'axios';

// Vite exposes environment variables prefixed with VITE_ to the client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken'); // Use localStorage for web
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
export const loginUser = (username, password) => api.post('/users/token', new URLSearchParams({ username, password }), {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
export const getMyProfile = () => api.get('/users/me');

// Game & Collection
export const searchBGG = (query) => api.get(`/games/search-bgg?query=${query}`);
export const getGameDetails = (bggId) => api.get(`/games/${bggId}`); // For general BGG details
export const addGameToCollection = (gameId, personalNotes, customTags) =>
  api.post('/games/collection/', { game_id: gameId, personal_notes: personalNotes, custom_tags: customTags });
export const getUserCollection = () => api.get('/games/collection/');
export const updateCollectionEntry = (entryId, updates) => api.put(`/games/collection/${entryId}`, updates);
export const deleteCollectionEntry = (entryId) => api.delete(`/games/collection/${entryId}`);

// Wishlist
export const getUserWishlist = () => api.get('/wishlists/');
export const addGameToWishlist = (gameId, priority, notes) => api.post('/wishlists/', { game_id: gameId, priority: priority, notes: notes });
export const deleteWishlistEntry = (entryId) => api.delete(`/wishlists/${entryId}`);
export const updateWishlistEntry = (entryId, updates) => api.put(`/wishlists/${entryId}`, updates);

// Public Profile (New for Web)
export const getPublicCollection = (username) => api.get(`/public/collections/${username}`);
export const getPublicWishlist = (username) => api.get(`/public/wishlists/${username}`);

export default api;
