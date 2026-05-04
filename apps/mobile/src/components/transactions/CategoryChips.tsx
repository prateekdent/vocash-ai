import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  categories: readonly string[];
  active: string;
  onSelect: (cat: string) => void;
};

export function CategoryChips({ categories, active, onSelect }: Props): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {categories.map(cat => {
        const isActive = active === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipIdle]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}>
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelIdle]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: '#fff',
    borderColor: '#E2E2EA',
  },
  chipActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },

  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelIdle: {
    color: '#6E6E7A',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
