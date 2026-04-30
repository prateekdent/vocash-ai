import React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type {
  ExpenseExtractResponse,
  UsageTodayResponse,
} from '../../types/api';

type VoiceState = 'idle' | 'recording' | 'transcript' | 'edit' | 'confirm';
type ExtractedExpense = {
  amount: string;
  currency: string;
  category: string;
  item: string;
  expense_date: string;
  notes: string;
  raw_transcript: string;
};

export function VoiceScreen(): React.JSX.Element {
  const [voiceState, setVoiceState] = React.useState<VoiceState>('idle');
  const [transcript, setTranscript] = React.useState('');
  const [extracted, setExtracted] = React.useState<ExtractedExpense | null>(
    null
  );
  const [extractLoading, setExtractLoading] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [usage, setUsage] = React.useState<UsageTodayResponse | null>(null);
  const [usageLoading, setUsageLoading] = React.useState(true);
  const [usageError, setUsageError] = React.useState<string | null>(null);

  const mockTranscript = 'Aaj 500 ka petrol bhara';

  const fetchUsage = React.useCallback(async (): Promise<void> => {
    setUsageLoading(true);
    setUsageError(null);
    try {
      const { data } = await apiClient.get<UsageTodayResponse>('/usage/today');
      setUsage(data);
    } catch (error) {
      setUsageError(getApiErrorMessage(error));
    } finally {
      setUsageLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  const startRecording = (): void => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setVoiceState('recording');
  };

  const stopRecording = (): void => {
    setTranscript(mockTranscript);
    setErrorMessage(null);
    setVoiceState('transcript');
  };

  const resetFlow = (): void => {
    setTranscript('');
    setExtracted(null);
    setExtractLoading(false);
    setSaveLoading(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setVoiceState('idle');
  };

  const extractExpense = async (): Promise<void> => {
    if (!transcript.trim()) {
      setErrorMessage('Transcript is required');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setExtractLoading(true);
    try {
      const { data } = await apiClient.post<ExpenseExtractResponse>(
        '/expense/extract',
        {
          transcript: transcript.trim(),
        }
      );
      setExtracted({
        amount: String(data.amount ?? ''),
        currency: String(data.currency ?? 'INR'),
        category: String(data.category ?? ''),
        item: String(data.item ?? ''),
        expense_date: String(data.expense_date ?? ''),
        notes: String(data.notes ?? ''),
        raw_transcript: String(data.raw_transcript ?? transcript.trim()),
      });
      setVoiceState('confirm');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setExtractLoading(false);
    }
  };

  const saveExpense = async (): Promise<void> => {
    if (!extracted) {
      setErrorMessage('Nothing to save');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaveLoading(true);
    try {
      await apiClient.post('/expense/save', {
        amount: Number(extracted.amount),
        currency: extracted.currency || 'INR',
        category: extracted.category,
        item: extracted.item,
        expense_date: extracted.expense_date,
        notes: extracted.notes || null,
        source: 'voice',
        raw_transcript: extracted.raw_transcript || transcript.trim(),
      });
      setSuccessMessage('Expense saved');
      await fetchUsage();
      setTimeout(() => resetFlow(), 600);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Voice</Text>
        <Text style={styles.subtitle}>State: {voiceState}</Text>
        {usageLoading ? (
          <Text style={styles.subtitle}>Loading usage...</Text>
        ) : null}
        {usageError ? (
          <Text style={styles.error}>Usage: {usageError}</Text>
        ) : null}
        {usage ? (
          <Text style={styles.helper}>
            {usage.used}/{usage.limit} used today
          </Text>
        ) : null}
        <Button
          title="Refresh Usage"
          onPress={() => void fetchUsage()}
          disabled={usageLoading}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}

        {voiceState === 'idle' && (
          <Button title="Start Recording" onPress={startRecording} />
        )}

        {voiceState === 'recording' && (
          <>
            <Text style={styles.helper}>Recording... (mock)</Text>
            <Button title="Stop Recording" onPress={stopRecording} />
          </>
        )}

        {voiceState === 'transcript' && (
          <>
            <Text style={styles.transcript}>{transcript}</Text>
            <Button
              title="Edit Transcript"
              onPress={() => setVoiceState('edit')}
            />
            <Button
              title={extractLoading ? 'Extracting...' : 'Extract Expense'}
              onPress={extractExpense}
              disabled={extractLoading}
            />
            <Button title="Reset" onPress={resetFlow} />
          </>
        )}

        {voiceState === 'edit' && (
          <>
            <TextInput
              style={styles.input}
              value={transcript}
              onChangeText={setTranscript}
              multiline
            />
            <Button
              title={extractLoading ? 'Extracting...' : 'Save Edit & Extract'}
              onPress={extractExpense}
              disabled={extractLoading}
            />
            <Button
              title="Cancel Edit"
              onPress={() => setVoiceState('transcript')}
            />
          </>
        )}

        {voiceState === 'confirm' && extracted && (
          <>
            <Text style={styles.helper}>Confirm extracted data:</Text>
            <TextInput
              style={styles.input}
              value={extracted.amount}
              onChangeText={(value) =>
                setExtracted((prev) =>
                  prev ? { ...prev, amount: value } : prev
                )
              }
              placeholder="Amount"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={extracted.category}
              onChangeText={(value) =>
                setExtracted((prev) =>
                  prev ? { ...prev, category: value } : prev
                )
              }
              placeholder="Category"
            />
            <TextInput
              style={styles.input}
              value={extracted.item}
              onChangeText={(value) =>
                setExtracted((prev) => (prev ? { ...prev, item: value } : prev))
              }
              placeholder="Item"
            />
            <TextInput
              style={styles.input}
              value={extracted.expense_date}
              onChangeText={(value) =>
                setExtracted((prev) =>
                  prev ? { ...prev, expense_date: value } : prev
                )
              }
              placeholder="YYYY-MM-DD"
            />
            <TextInput
              style={styles.input}
              value={extracted.notes}
              onChangeText={(value) =>
                setExtracted((prev) =>
                  prev ? { ...prev, notes: value } : prev
                )
              }
              placeholder="Notes (optional)"
            />
            <Button
              title={saveLoading ? 'Saving...' : 'Confirm & Save'}
              onPress={saveExpense}
              disabled={saveLoading}
            />
            <Button
              title="Back to Edit Transcript"
              onPress={() => setVoiceState('edit')}
            />
            <Button title="Reset" onPress={resetFlow} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#666' },
  helper: { fontSize: 14 },
  transcript: { fontSize: 16, paddingVertical: 8 },
  error: { color: '#b71c1c', fontSize: 13 },
  success: { color: '#1b5e20', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    minHeight: 80,
    padding: 10,
    textAlignVertical: 'top',
  },
});
