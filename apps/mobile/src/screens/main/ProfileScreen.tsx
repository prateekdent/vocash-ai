import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { UsageTodayResponse } from '../../types/api';

export function ProfileScreen(): React.JSX.Element {
  const [usage, setUsage] = React.useState<UsageTodayResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsage = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<UsageTodayResponse>('/usage/today');
      setUsage(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        {isLoading ? (
          <Text style={styles.subtitle}>Loading usage...</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {usage ? (
          <>
            <Text style={styles.subtitle}>
              {usage.used}/{usage.limit} used today
            </Text>
            <Text style={styles.subtitle}>Remaining: {usage.remaining}</Text>
          </>
        ) : null}
        <Button
          title="Refresh Usage"
          onPress={() => void fetchUsage()}
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
    gap: 8,
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#666' },
  error: { fontSize: 13, color: '#b71c1c' },
});
