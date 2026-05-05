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

type Props = {
  visible: boolean;
  category: string;
  currentLimit: number;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (limitAmount: number) => Promise<void>;
};

// Prevents tap-through to the backdrop without an inline arrow function.
function stopEvent(): void { /* intentional noop */ }

export function SetBudgetModal({
  visible,
  category,
  currentLimit,
  isSaving,
  error,
  onClose,
  onSave,
}: Props): React.JSX.Element {
  const [amount, setAmount] = React.useState('');

  // Re-populate the field whenever the modal opens or target category changes.
  React.useEffect(() => {
    if (visible) {
      setAmount(currentLimit > 0 ? String(currentLimit) : '');
    }
  }, [visible, currentLimit]);

  const handleSave = (): void => {
    const parsed = Number(amount.trim());
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) { return; }
    void onSave(parsed);
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
            <Text style={styles.title}>Set Monthly Limit</Text>
            <Text style={styles.subtitle}>{category}</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.field}>
              <Text style={styles.label}>LIMIT AMOUNT (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="e.g. 5000"
                placeholderTextColor="#aaa"
                autoFocus
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.btn, styles.cancelBtn]}>
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
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: -4 },
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
