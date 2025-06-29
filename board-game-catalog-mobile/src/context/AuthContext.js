// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '../utils/AsyncStorage';
import { loginUser, registerUser, getMyProfile } from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial loading (checking token)
  const [authError, setAuthError] = useState(null);

  const checkLoggedInUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Optionally validate token with backend, e.g., getMyProfile
        const profileResponse = await getMyProfile();
        if (profileResponse.status === 200) {
            setUserToken(token);
        } else {
            await AsyncStorage.removeItem('userToken'); // Token invalid
        }
      }
    } catch (e) {
      console.error('Error checking logged in user:', e);
      await AsyncStorage.removeItem('userToken'); // Clear token on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Axios for form-urlencoded expects data as URLSearchParams or plain object in 'data' field
      // but 'username' and 'password' should directly map to form fields.
      // FastAPI's OAuth2PasswordRequestForm needs x-www-form-urlencoded format for body
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await loginUser(email, password); // api.js already handles content-type for this endpoint
      const token = response.data.access_token;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      return true; // Indicate success
    } catch (e) {
      const message = e.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthError(message);
      console.error('Login error:', e);
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await registerUser(email, password);
      // After successful registration, automatically log in
      const success = await login(email, password);
      return success; // Return login success status
    } catch (e) {
      const message = e.response?.data?.detail || 'Registration failed. Please try again.';
      setAuthError(message);
      console.error('Registration error:', e);
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, authError, login, register, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};
