// src/screens/Auth/RegisterScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, authError, setAuthError } = useContext(AuthContext);

  const handleRegister = async () => {
    setAuthError(null); // Clear previous errors
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    const success = await register(email, password);
    if (success) {
      Alert.alert('Success', 'Registration successful! You are now logged in.');
      // AuthContext will handle navigation to AppStack
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
  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (authError) setAuthError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
      />
      {authError && <Text style={styles.errorText}>{authError}</Text>}
      <Button title={isLoading ? "Registering..." : "Register"} onPress={handleRegister} disabled={isLoading} />
      {isLoading && <ActivityIndicator size="small" color="#0000ff" style={styles.spinner} />}
      <Button title="Already have an account? Login" onPress={() => navigation.navigate('Login')} color="gray" />
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

export default RegisterScreen;
