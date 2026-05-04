import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCategoryColor } from '../transactions/categoryColors';

type Props = {
  category: string;
  amount: number | string;
  percent: number;
};

function formatAmount(value: number | string): string {
  const n = Number(value);
  if (isNaN(n)) { return '0'; }
  return n.toLocaleString('en-IN');
}

export function CategoryBreakdownRow({ category, amount, percent }: Props): React.JSX.Element {
  const color = getCategoryColor(category);
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{category}</Text>
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${clampedPercent}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.percent}>{percent}%</Text>
        </View>
      </View>
      <Text style={styles.amount}>₹ {formatAmount(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#F0F0F5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  percent: {
    fontSize: 11,
    color: '#ADADB8',
    fontWeight: '500',
    width: 30,
    textAlign: 'right',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    flexShrink: 0,
  },
});
