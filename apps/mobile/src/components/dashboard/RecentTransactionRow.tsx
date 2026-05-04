import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  item: string;
  expenseDate: string;
  amount: number | string;
  isLast?: boolean;
};

function formatAmount(value: number | string): string {
  const n = Number(value);
  if (isNaN(n)) { return '0'; }
  return n.toLocaleString('en-IN');
}

export function RecentTransactionRow({ item, expenseDate, amount, isLast = false }: Props): React.JSX.Element {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{item}</Text>
        <Text style={styles.date}>{expenseDate}</Text>
      </View>
      <Text style={styles.amount}>₹ {formatAmount(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  left: {
    flex: 1,
    paddingRight: 12,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  date: {
    fontSize: 12,
    color: '#ADADB8',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    flexShrink: 0,
  },
});
