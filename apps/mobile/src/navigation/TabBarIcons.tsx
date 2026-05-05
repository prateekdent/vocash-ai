import React from 'react';
import { StyleSheet, View } from 'react-native';

type IconProps = { color: string; size: number };

/** 2 × 2 grid — Dashboard */
export function DashboardIcon({ color, size }: IconProps): React.JSX.Element {
  const cell = Math.round(size * 0.36);
  const gap = Math.round(size * 0.08);
  return (
    <View style={[styles.grid, { gap }]}>
      <View style={[styles.gridRow, { gap }]}>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ width: cell, height: cell, borderRadius: 2, backgroundColor: color }} />
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ width: cell, height: cell, borderRadius: 2, backgroundColor: color }} />
      </View>
      <View style={[styles.gridRow, { gap }]}>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ width: cell, height: cell, borderRadius: 2, backgroundColor: color }} />
        {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ width: cell, height: cell, borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

/** Three horizontal lines — Transactions */
export function TransactionsIcon({ color, size }: IconProps): React.JSX.Element {
  const lineH = Math.round(size * 0.1);
  const radius = lineH / 2;
  const full = Math.round(size * 0.82);
  const short = Math.round(size * 0.55);
  const gap = Math.round(size * 0.18);
  return (
    <View style={[styles.lines, { gap }]}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ width: full, height: lineH, borderRadius: radius, backgroundColor: color }} />
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ width: full, height: lineH, borderRadius: radius, backgroundColor: color }} />
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ width: short, height: lineH, borderRadius: radius, backgroundColor: color }} />
    </View>
  );
}

/** Circle head + arc shoulders — Profile */
export function ProfileIcon({ color, size }: IconProps): React.JSX.Element {
  const headSize = Math.round(size * 0.38);
  const shoulderW = Math.round(size * 0.72);
  const shoulderH = Math.round(size * 0.36);
  return (
    <View style={styles.person}>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{
        width: headSize,
        height: headSize,
        borderRadius: headSize / 2,
        borderWidth: Math.round(size * 0.1),
        borderColor: color,
        marginBottom: Math.round(size * 0.06),
      }} />
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{
        width: shoulderW,
        height: shoulderH,
        borderTopLeftRadius: shoulderW / 2,
        borderTopRightRadius: shoulderW / 2,
        borderTopWidth: Math.round(size * 0.1),
        borderLeftWidth: Math.round(size * 0.1),
        borderRightWidth: Math.round(size * 0.1),
        borderBottomWidth: 0,
        borderColor: color,
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignItems: 'center', justifyContent: 'center' },
  gridRow: { flexDirection: 'row' },
  lines: { alignItems: 'flex-start', justifyContent: 'center' },
  person: { alignItems: 'center', justifyContent: 'flex-end' },
});
