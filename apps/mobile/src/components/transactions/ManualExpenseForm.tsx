import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Category options available for manual entry.
 * 'All' is intentionally excluded — it is a filter sentinel, not a real category.
 */
export const MANUAL_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Savings & Investment',
  'Family & Personal',
  'Other',
] as const;

export type ManualFormValues = {
  item: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
};

type Props = {
  values: ManualFormValues;
  onChange: <K extends keyof ManualFormValues>(key: K, value: string) => void;
};

export function ManualExpenseForm({ values, onChange }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Item</Text>
        <TextInput
          style={styles.input}
          value={values.item}
          onChangeText={v => onChange('item', v)}
          placeholder="What did you spend on?"
          placeholderTextColor="#aaa"
          maxLength={120}
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={values.amount}
          onChangeText={v => onChange('amount', v)}
          placeholder="0"
          placeholderTextColor="#aaa"
          keyboardType="decimal-pad"
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled">
          {MANUAL_CATEGORIES.map(cat => {
            const active = values.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
                onPress={() => onChange('category', cat)}
                activeOpacity={0.7}>
                <Text style={[styles.chipLabel, active ? styles.chipLabelActive : styles.chipLabelIdle]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={values.date}
          onChangeText={v => onChange('date', v)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#aaa"
          maxLength={10}
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={values.notes}
          onChangeText={v => onChange('notes', v)}
          placeholder="Any additional context"
          placeholderTextColor="#aaa"
          multiline
          textAlignVertical="top"
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  field: { gap: 6 },
  label: {
    fontSize: 11,
    color: '#ADADB8',
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
  notesInput: {
    minHeight: 68,
    paddingTop: 11,
  },

  chips: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIdle: { backgroundColor: '#fff', borderColor: '#E2E2EA' },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipLabel: { fontSize: 13, fontWeight: '500' },
  chipLabelIdle: { color: '#6E6E7A' },
  chipLabelActive: { color: '#fff', fontWeight: '600' },
});
