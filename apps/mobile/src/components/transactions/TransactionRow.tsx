import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ExpenseListItem } from '../../types/api';
import { getCategoryColor } from './categoryColors';

type Props = {
  item: ExpenseListItem;
  isDeleting: boolean;
  onPress: (item: ExpenseListItem) => void;
  onDelete: (item: ExpenseListItem) => void;
};

export function TransactionRow({
  item,
  isDeleting,
  onPress,
  onDelete,
}: Props): React.JSX.Element {
  const dotColor = getCategoryColor(item.category);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      activeOpacity={0.6}
      disabled={isDeleting}>
      {/* Category accent dot — color is dynamic, eslint-disable is intentional */}
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{item.item}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.category} · {item.expense_date}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>₹ {item.amount}</Text>
        {isDeleting ? (
          <ActivityIndicator size="small" color="#C0C0CC" style={styles.spinner} />
        ) : (
          <TouchableOpacity
            onPress={() => onDelete(item)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 13,
    marginTop: 1,
    flexShrink: 0,
  },

  left: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: -0.1,
  },
  meta: {
    fontSize: 12,
    color: '#ADADB8',
    fontWeight: '400',
  },

  right: {
    alignItems: 'flex-end',
    marginLeft: 12,
    gap: 5,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  deleteBtn: { opacity: 0.28 },
  deleteIcon: { fontSize: 13 },
  spinner: { marginTop: 2 },
});
