// src/screens/Auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, authError, setAuthError } = useContext(AuthContext);

  const handleLogin = async () => {
    setAuthError(null); // Clear previous errors
    const success = await login(email, password);
    if (success) {
      // Login successful, AuthContext will handle navigation via RootNavigator
      console.log('Login successful');
    }
  };

  // Clear error when user starts typing again
  const handleEmailChange = (text) => {
    setEmail(text);
    if (authError) setAuthError(null);
  };
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (authError) setAuthError(null);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      {authError && <Text style={styles.errorText}>{authError}</Text>}
      <Button title={isLoading ? "Logging In..." : "Login"} onPress={handleLogin} disabled={isLoading} />
      {isLoading && <ActivityIndicator size="small" color="#0000ff" style={styles.spinner} />}
      <Button title="Don't have an account? Register" onPress={() => navigation.navigate('Register')} color="gray" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  spinner: {
    marginTop: 10,
  }
});

export default LoginScreen;
