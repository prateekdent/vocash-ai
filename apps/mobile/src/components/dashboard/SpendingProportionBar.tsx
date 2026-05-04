import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCategoryColor } from '../transactions/categoryColors';

type BreakdownItem = {
  category: string;
  amount: number | string;
  percent: number;
};

type Props = {
  breakdown: BreakdownItem[];
};

/**
 * Renders a horizontal multi-color proportion bar followed by a compact legend.
 * Each segment's width is driven by `flex: percent` so proportions are accurate
 * without percentage string math. Returns null when breakdown is empty.
 */
export function SpendingProportionBar({ breakdown }: Props): React.JSX.Element | null {
  if (breakdown.length === 0) { return null; }

  return (
    <View style={styles.container}>
      {/* Proportion bar */}
      <View style={styles.bar}>
        {breakdown.map(item => (
          <View
            key={item.category}
            style={{
              flex: Math.max(item.percent, 2),
              backgroundColor: getCategoryColor(item.category),
            }}
          />
        ))}
      </View>

      {/* Compact legend */}
      <View style={styles.legend}>
        {breakdown.map(item => {
          const color = getCategoryColor(item.category);
          return (
            <View key={item.category} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F0F0F5',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 11,
    color: '#6E6E7A',
    fontWeight: '500',
  },
});
