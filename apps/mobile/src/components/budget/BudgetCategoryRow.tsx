import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryColor } from '../transactions/categoryColors';

type Props = {
  category: string;
  limitAmount: number;
  spentAmount: number;
  onPress: () => void;
};

function progressBarColor(ratio: number): string {
  if (ratio >= 1) { return '#FF6B6B'; }
  if (ratio >= 0.9) { return '#FF9F43'; }
  return '#20BF6B';
}

export function BudgetCategoryRow({
  category,
  limitAmount,
  spentAmount,
  onPress,
}: Props): React.JSX.Element {
  const isSet = limitAmount > 0;
  const ratio = isSet ? spentAmount / limitAmount : 0;
  const remaining = limitAmount - spentAmount;
  const isOver = spentAmount > limitAmount;
  const fillPercent = Math.min(ratio * 100, 100);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.categoryLeft}>
          <View style={[styles.dot, { backgroundColor: getCategoryColor(category) }]} />
          <Text style={styles.categoryName}>{category}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      {isSet ? (
        <>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${fillPercent}%` as `${number}%`,
                  backgroundColor: progressBarColor(ratio),
                },
              ]}
            />
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.spentText}>
              ₹{spentAmount.toLocaleString('en-IN')} of ₹{limitAmount.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.remainingText, isOver && styles.overText]}>
              {isOver
                ? `Over by ₹${Math.abs(remaining).toLocaleString('en-IN')}`
                : `₹${remaining.toLocaleString('en-IN')} left`}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.unsetText}>Set limit</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  chevron: {
    fontSize: 20,
    color: '#CCC',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#F0F0F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    fontSize: 12,
    color: '#888',
  },
  remainingText: {
    fontSize: 12,
    color: '#20BF6B',
    fontWeight: '600',
  },
  overText: {
    color: '#FF6B6B',
  },
  unsetText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '500',
  },
});
