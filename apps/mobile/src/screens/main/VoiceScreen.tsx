import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { ExpenseExtractResponse, UsageTodayResponse } from '../../types/api';

type VoiceState = 'idle' | 'recording' | 'transcript' | 'confirm';

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
  const [partialTranscript, setPartialTranscript] = React.useState('');
  const [extracted, setExtracted] = React.useState<ExtractedExpense | null>(null);
  const [extractLoading, setExtractLoading] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [usage, setUsage] = React.useState<UsageTodayResponse | null>(null);

  // ── Voice event wiring ────────────────────────────────────────────────────
  React.useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const result = e.value?.[0] ?? '';
      setTranscript(result);
      setPartialTranscript('');
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      setPartialTranscript(e.value?.[0] ?? '');
    };

    Voice.onSpeechEnd = () => {
      setVoiceState('transcript');
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message ?? 'Voice recognition error');
      setVoiceState('idle');
    };

    return () => {
      void Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  // ── Usage ─────────────────────────────────────────────────────────────────
  const fetchUsage = React.useCallback(async (): Promise<void> => {
    try {
      const { data } = await apiClient.get<UsageTodayResponse>('/usage/today');
      setUsage(data);
    } catch {
      // non-blocking
    }
  }, []);

  React.useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startRecording = async (): Promise<void> => {
    setError(null);
    setSuccess(null);
    setTranscript('');
    setPartialTranscript('');
    try {
      await Voice.start('hi-IN'); // Hindi-India; falls back to English naturally
      setVoiceState('recording');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const stopRecording = async (): Promise<void> => {
    try {
      await Voice.stop();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const extractExpense = async (): Promise<void> => {
    const text = transcript.trim();
    if (!text) {
      setError('No transcript to extract from');
      return;
    }
    setError(null);
    setExtractLoading(true);
    try {
      const { data } = await apiClient.post<ExpenseExtractResponse>('/expense/extract', {
        transcript: text,
      });
      setExtracted({
        amount: String(data.amount ?? ''),
        currency: String(data.currency ?? 'INR'),
        category: String(data.category ?? ''),
        item: String(data.item ?? ''),
        expense_date: String(data.expense_date ?? ''),
        notes: String(data.notes ?? ''),
        raw_transcript: String(data.raw_transcript ?? text),
      });
      setVoiceState('confirm');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setExtractLoading(false);
    }
  };

  const saveExpense = async (): Promise<void> => {
    if (!extracted) return;
    setError(null);
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
        raw_transcript: extracted.raw_transcript,
      });
      setSuccess('Expense saved!');
      await fetchUsage();
      setTimeout(() => reset(), 800);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaveLoading(false);
    }
  };

  const reset = (): void => {
    setVoiceState('idle');
    setTranscript('');
    setPartialTranscript('');
    setExtracted(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Usage pill */}
        <View style={styles.usagePill}>
          <Text style={styles.usageText}>
            {usage ? `${usage.used} / ${usage.limit} extractions today` : 'Loading usage...'}
          </Text>
        </View>

        {/* Main mic card */}
        <View style={styles.card}>
          {voiceState === 'idle' && (
            <>
              <Text style={styles.cardTitle}>Tap to record</Text>
              <Text style={styles.cardSub}>Speak your expense in Hindi or English</Text>
              <TouchableOpacity
                style={styles.micBtn}
                onPress={startRecording}>
                <Text style={styles.micIcon}>🎙️</Text>
              </TouchableOpacity>
            </>
          )}

          {voiceState === 'recording' && (
            <>
              <Text style={styles.cardTitle}>Listening...</Text>
              <Text style={styles.partialText}>
                {partialTranscript || 'Speak now'}
              </Text>
              <TouchableOpacity style={[styles.micBtn, styles.micBtnActive]} onPress={stopRecording}>
                <Text style={styles.micIcon}>⏹️</Text>
              </TouchableOpacity>
              <Text style={styles.cardSub}>Tap to stop</Text>
            </>
          )}

          {voiceState === 'transcript' && (
            <>
              <Text style={styles.cardTitle}>Got it — review</Text>
              <TextInput
                style={styles.transcriptInput}
                value={transcript}
                onChangeText={setTranscript}
                multiline
                placeholder="Edit transcript if needed..."
              />
              <View style={styles.rowBtns}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={reset}>
                  <Text style={styles.secondaryBtnText}>Redo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, extractLoading && styles.btnDisabled]}
                  onPress={extractExpense}
                  disabled={extractLoading}>
                  {extractLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Extract →</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          {voiceState === 'confirm' && extracted && (
            <>
              <Text style={styles.cardTitle}>Confirm expense</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Amount (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={extracted.amount}
                  onChangeText={v => setExtracted(p => p ? { ...p, amount: v } : p)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Item</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={extracted.item}
                  onChangeText={v => setExtracted(p => p ? { ...p, item: v } : p)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={extracted.category}
                  onChangeText={v => setExtracted(p => p ? { ...p, category: v } : p)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={extracted.expense_date}
                  onChangeText={v => setExtracted(p => p ? { ...p, expense_date: v } : p)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={extracted.notes}
                  onChangeText={v => setExtracted(p => p ? { ...p, notes: v } : p)}
                  placeholder="Optional"
                />
              </View>

              <View style={styles.rowBtns}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={reset}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, saveLoading && styles.btnDisabled]}
                  onPress={saveExpense}
                  disabled={saveLoading}>
                  {saveLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Save ✓</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Feedback messages */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  scroll: { padding: 16, gap: 16, alignItems: 'center' },

  usagePill: {
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  usageText: { fontSize: 13, color: '#6C63FF', fontWeight: '600' },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  cardSub: { fontSize: 13, color: '#888', textAlign: 'center' },

  micBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  micBtnActive: { backgroundColor: '#e53935' },
  micIcon: { fontSize: 36 },

  partialText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
    minHeight: 48,
  },

  transcriptInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#1A1A2E',
  },

  field: { width: '100%', gap: 4 },
  fieldLabel: { fontSize: 12, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A2E',
  },

  rowBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F0F0F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#555', fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },

  error: { color: '#e53935', fontSize: 13, textAlign: 'center' },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
