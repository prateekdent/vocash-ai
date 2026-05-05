import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  dayNum: number;
  weekday: string;
  total: number;
};

export function DaySectionHeader({ dayNum, weekday, total }: Props): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.dayNum}>{dayNum}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{weekday}</Text>
      </View>
      <View style={styles.spacer} />
      <Text style={styles.total}>
        ₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#F7F8FC',
    gap: 8,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    minWidth: 22,
  },
  badge: {
    backgroundColor: '#EDEDF7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 0.3,
  },
  spacer: { flex: 1 },
  total: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
});
