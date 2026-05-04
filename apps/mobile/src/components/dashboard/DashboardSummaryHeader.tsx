import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  totalSpend: number | string;
  month: string;
  categoryCount: number;
};

function formatAmount(value: number | string): string {
  const n = Number(value);
  if (isNaN(n)) { return '0'; }
  return n.toLocaleString('en-IN');
}

export function DashboardSummaryHeader({ totalSpend, month, categoryCount }: Props): React.JSX.Element {
  const catLabel =
    categoryCount > 0
      ? ` · ${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`
      : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Spend</Text>
      <Text style={styles.amount}>₹ {formatAmount(totalSpend)}</Text>
      <Text style={styles.meta}>{month}{catLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#fff',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ADADB8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  amount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -1,
  },
  meta: {
    fontSize: 13,
    color: '#ADADB8',
    fontWeight: '400',
  },
});
