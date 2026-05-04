import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ExpenseListItem } from '../../types/api';

export type EditFormValues = {
  amount: string;
  item: string;
  category: string;
  date: string;
};

type Props = {
  visible: boolean;
  expense: ExpenseListItem | null;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: EditFormValues) => Promise<void>;
};

// Prevents tap-through to the backdrop without an inline arrow function.
function stopEvent(): void { /* intentional noop */ }

export function EditTransactionModal({
  visible,
  expense,
  isSaving,
  error,
  onClose,
  onSave,
}: Props): React.JSX.Element {
  const [amount, setAmount] = React.useState('');
  const [item, setItem] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState('');

  // Re-populate form whenever the expense being edited changes.
  React.useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setItem(expense.item);
      setCategory(expense.category);
      setDate(expense.expense_date);
    }
  }, [expense]);

  const handleSave = (): void => {
    void onSave({ amount, item, category, date });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoider}>
          <Pressable style={styles.card} onPress={stopEvent}>
            <View style={styles.handle} />
            <Text style={styles.title}>Edit Transaction</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.field}>
              <Text style={styles.label}>AMOUNT (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>ITEM</Text>
              <TextInput
                style={styles.input}
                value={item}
                onChangeText={setItem}
                placeholder="What was it?"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>CATEGORY</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Category"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>DATE</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.btn, styles.confirmBtn, isSaving && styles.btnDisabled]}
                disabled={isSaving}>
                {isSaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.confirmText}>Save</Text>}
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
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' },
  errorText: { color: '#b71c1c', fontSize: 13, textAlign: 'center' },
  field: { gap: 4 },
  label: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1A1A2E',
    backgroundColor: '#FAFAFA',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F5' },
  cancelText: { color: '#666', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#6C63FF' },
  confirmText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
