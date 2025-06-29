// src/utils/AsyncStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('AsyncStorage set error:', e);
  }
};

const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error('AsyncStorage get error:', e);
    return null;
  }
};

const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('AsyncStorage remove error:', e);
  }
};

export default {
  setItem,
  getItem,
  removeItem,
};
