import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import { ManualExpenseForm, type ManualFormValues } from './ManualExpenseForm';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const EMPTY_FORM: ManualFormValues = {
  item: '',
  amount: '',
  category: '',
  date: '',
  notes: '',
};

function validate(v: ManualFormValues): string | null {
  if (!v.item.trim()) { return 'Item name is required.'; }
  const amt = Number(v.amount);
  if (!v.amount.trim() || isNaN(amt) || amt <= 0) {
    return 'Enter a valid amount greater than 0.';
  }
  if (!v.category) { return 'Select a category.'; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date.trim())) {
    return 'Date must be in YYYY-MM-DD format.';
  }
  return null;
}

// Prevents tap-through to the backdrop without an inline arrow function.
function stopEvent(): void { /* intentional noop */ }

export function ManualExpenseSheet({ visible, onClose, onSaved }: Props): React.JSX.Element {
  const [values, setValues] = React.useState<ManualFormValues>(EMPTY_FORM);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-initialise every time the sheet opens so stale data never leaks through.
  React.useEffect(() => {
    if (visible) {
      setValues({ ...EMPTY_FORM, date: todayIso() });
      setError(null);
    }
  }, [visible]);

  const handleChange = React.useCallback(
    <K extends keyof ManualFormValues>(key: K, value: string): void => {
      setValues(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = async (): Promise<void> => {
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await apiClient.post('/expense/save', {
        amount: Number(values.amount),
        currency: 'INR',
        category: values.category.trim(),
        item: values.item.trim(),
        expense_date: values.date.trim(),
        notes: values.notes.trim() || null,
        source: 'manual',
        raw_transcript: null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (): void => {
    if (isSaving) { return; }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoider}>
          <Pressable style={styles.sheet} onPress={stopEvent}>
            <View style={styles.handle} />
            <Text style={styles.title}>Add Expense</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formScroll}>
              <ManualExpenseForm values={values} onChange={handleChange} />
            </ScrollView>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={handleClose}
                disabled={isSaving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={() => void handleSave()}
                disabled={isSaving}>
                {isSaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  avoider: { width: '100%' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  formScroll: { paddingVertical: 8 },
  errorText: {
    color: '#b71c1c',
    fontSize: 13,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F5' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6C63FF' },
  saveText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
