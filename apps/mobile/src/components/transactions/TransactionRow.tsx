import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ExpenseListItem } from '../../types/api';

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
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      disabled={isDeleting}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{item.item}</Text>
        <Text style={styles.meta}>{item.category}  ·  {item.expense_date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>₹ {item.amount}</Text>
        {isDeleting ? (
          <ActivityIndicator size="small" color="#6C63FF" style={styles.spinner} />
        ) : (
          <TouchableOpacity
            onPress={() => onDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  left: { flex: 1, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 3 },
  meta: { fontSize: 12, color: '#999' },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 15, fontWeight: '700', color: '#6C63FF' },
  deleteIcon: { fontSize: 14, opacity: 0.4 },
  spinner: { marginTop: 4 },
});
