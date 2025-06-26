// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getMyProfile } from '../api/api'; // Correct import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadUserFromStorage = async () => {
    try {
      const token = localStorage.getItem('userToken'); // Use localStorage for web
      if (token) {
        setUserToken(token);
        // Validate token with backend
        const profileResponse = await getMyProfile();
        if (profileResponse.status === 200) {
          setCurrentUser(profileResponse.data);
        } else {
          localStorage.removeItem('userToken');
          setUserToken(null);
        }
      }
    } catch (e) {
      console.error('Error loading user from storage:', e);
      localStorage.removeItem('userToken');
      setUserToken(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await loginUser(email, password);
      const token = response.data.access_token;
      localStorage.setItem('userToken', token); // Use localStorage
      setUserToken(token);
      await loadUserFromStorage(); // Reload user profile and set current user
      return true;
    } catch (e) {
      const message = e.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthError(message);
      console.error('Login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await registerUser(email, password);
      const success = await login(email, password);
      return success;
    } catch (e) {
      const message = e.response?.data?.detail || 'Registration failed. Please try again.';
      setAuthError(message);
      console.error('Registration error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('userToken'); // Use localStorage
      setUserToken(null);
      setCurrentUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, currentUser, isLoading, authError, login, register, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};
