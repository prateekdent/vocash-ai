import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { monthLabel } from '../../utils/date';

type Props = {
  date: Date;
  onNavigate: (dir: -1 | 1) => void;
  /** When provided, the month pill becomes a Pressable (e.g. to open a date picker). */
  onPillPress?: () => void;
};

export function MonthNavigator({ date, onNavigate, onPillPress }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onNavigate(-1)} style={styles.btn}>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      {onPillPress ? (
        <Pressable onPress={onPillPress} style={styles.pill}>
          <Text style={styles.pillText}>📅  {monthLabel(date)}</Text>
        </Pressable>
      ) : (
        <View style={styles.pill}>
          <Text style={styles.pillText}>📅  {monthLabel(date)}</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => onNavigate(1)} style={styles.btn}>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  btn: { padding: 8 },
  arrow: { fontSize: 28, color: '#6C63FF', fontWeight: '300' },
  pill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  pillText: { fontSize: 15, fontWeight: '600', color: '#6C63FF' },
});
