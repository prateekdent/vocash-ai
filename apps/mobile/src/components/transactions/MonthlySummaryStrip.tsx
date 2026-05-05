import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  total: number;
  /** True when not all pages are loaded — shows a partial-data indicator */
  isPartial?: boolean;
};

function formatAmount(n: number): string {
  return `₹ ${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function MonthlySummaryStrip({ total, isPartial = false }: Props): React.JSX.Element {
  return (
    <View style={styles.strip}>
      <View style={styles.col}>
        <Text style={styles.label}>Expenses</Text>
        <Text style={styles.value} numberOfLines={1}>
          {formatAmount(total)}
          {isPartial ? <Text style={styles.partial}>  partial</Text> : null}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  col: {
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: '#ADADB8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  partial: {
    fontSize: 11,
    color: '#ADADB8',
    fontWeight: '400',
  },
});
