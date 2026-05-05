import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ExpenseListItem } from '../../types/api';
import { getCategoryColor } from './categoryColors';

type Props = {
  item: ExpenseListItem;
  onPress: (item: ExpenseListItem) => void;
};

export function LedgerTransactionRow({ item, onPress }: Props): React.JSX.Element {
  const dotColor = getCategoryColor(item.category);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      activeOpacity={0.55}>
      {/* Category accent dot — color is dynamic, intentional inline style */}
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{item.item}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.category}</Text>
      </View>

      <Text style={styles.amount}>
        ₹ {Number(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 12,
    flexShrink: 0,
    marginTop: 1,
  },
  left: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: -0.1,
  },
  meta: {
    fontSize: 11,
    color: '#ADADB8',
    fontWeight: '400',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
});
