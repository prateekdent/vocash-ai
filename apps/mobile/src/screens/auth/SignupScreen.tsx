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

export function SignupScreen({
  navigation,
}: {
  navigation: any;
}): React.JSX.Element {
  const { register, authError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const onSignup = async (): Promise<void> => {
    setLocalError(null);
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required');
      return;
    }
    setIsLoading(true);
    try {
      await register({ email: email.trim(), password });
    } catch {
      // Global authError is shown below.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Signup</Text>
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
          title={isLoading ? 'Creating account...' : 'Signup'}
          onPress={onSignup}
          disabled={isLoading}
        />
        <Button
          title="Go to Login"
          onPress={() => navigation.goBack()}
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
    paddingHorizontal: 24,
    gap: 12,
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
