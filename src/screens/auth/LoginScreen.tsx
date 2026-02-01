/**
 * Login Screen
 *
 * Handles user authentication with username/password
 * Features:
 * - Username and password input fields
 * - Secure password entry
 * - Loading state during login
 * - Error display
 * - Remember server URL option
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';

export function LoginScreen() {
  const theme = useTheme();
  const { login, isLoading, error, checkAuth } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://api.movie-pilot.org');

  const handleLogin = async () => {
    // Validate inputs
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (!success) {
      Alert.alert('Login Failed', error || 'Please check your credentials and try again');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={{ color: '#E50914', fontWeight: 'bold' }}>
              MoviePilot
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Sign in to continue
            </Text>
          </View>

          {/* Server URL (Optional - for custom deployments) */}
          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            left={<TextInput.Icon icon="server" />}
          />

          {/* Username Input */}
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
            disabled={isLoading}
          />

          {/* Password Input */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            disabled={isLoading}
            onSubmitEditing={handleLogin}
          />

          {/* Error Message */}
          {error && (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            buttonColor="#E50914"
          >
            Sign In
          </Button>

          {/* Version Info */}
          <Text variant="bodySmall" style={styles.versionText}>
            MoviePilot Mobile v0.1.0
          </Text>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.5,
  },
});
