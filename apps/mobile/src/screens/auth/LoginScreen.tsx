import React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../store/auth/AuthContext';

export function LoginScreen({
  navigation,
}: {
  navigation: any;
}): React.JSX.Element {
  const { login, authError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const onLogin = async (): Promise<void> => {
    setLocalError(null);
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch {
      // Global authError is shown below.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        {localError ? <Text style={styles.error}>{localError}</Text> : null}
        {authError ? <Text style={styles.error}>{authError}</Text> : null}
        <Button
          title={isLoading ? 'Signing in...' : 'Login'}
          onPress={onLogin}
          disabled={isLoading}
        />
        <Button
          title="Go to Signup"
          onPress={() => navigation.navigate('Signup')}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: { fontSize: 24, fontWeight: '600' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: { color: '#c62828', fontSize: 13 },
});
