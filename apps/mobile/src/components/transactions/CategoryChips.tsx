import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
};

export function CategoryChips({ categories, active, onSelect }: Props): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat}
          style={[styles.chip, active === cat && styles.chipActive]}
          onPress={() => onSelect(cat)}>
          <Text style={[styles.label, active === cat && styles.labelActive]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0EEFF',
  },
  chipActive: { backgroundColor: '#6C63FF' },
  label: { fontSize: 13, color: '#6C63FF', fontWeight: '500' },
  labelActive: { color: '#fff', fontWeight: '600' },
});
