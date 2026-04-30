import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { DashboardSummaryResponse } from '../../types/api';

function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function dateToMonthParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function DashboardScreen(): React.JSX.Element {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(today);
  const [data, setData] = React.useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSummary = React.useCallback(
    async (forDate?: Date): Promise<void> => {
      const target = forDate ?? selectedDate;
      setIsLoading(true);
      setError(null);
      try {
        const { data: response } =
          await apiClient.get<DashboardSummaryResponse>('/dashboard/summary', {
            params: { month: dateToMonthParam(target) },
          });
        setData(response);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate]
  );

  React.useEffect(() => {
    void fetchSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPicker = (): void => {
    setTempDate(selectedDate);
    setPickerVisible(true);
  };

  const confirmPicker = (): void => {
    setSelectedDate(tempDate);
    setPickerVisible(false);
    void fetchSummary(tempDate);
  };

  const cancelPicker = (): void => {
    setPickerVisible(false);
  };

  const navigateMonth = (direction: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + direction);
    setSelectedDate(next);
    void fetchSummary(next);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Pressable onPress={openPicker} style={styles.monthPill}>
          <Text style={styles.monthPillText}>📅  {monthLabel(selectedDate)}</Text>
        </Pressable>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Month picker modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelPicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_e, date) => {
                if (date) setTempDate(date);
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={cancelPicker}
                style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPicker}
                style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => void fetchSummary()}
            style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Total spend card */}
          <View style={styles.spendCard}>
            <Text style={styles.spendLabel}>Total Spend</Text>
            <Text style={styles.spendAmount}>
              ₹ {data?.total_spend ?? 0}
            </Text>
            <Text style={styles.spendMonth}>{data?.month}</Text>
          </View>

          {/* Category breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {!data || data.category_breakdown.length === 0 ? (
              <Text style={styles.empty}>No category data</Text>
            ) : (
              data.category_breakdown.map(item => (
                <View key={item.category} style={styles.catRow}>
                  <View style={styles.catInfo}>
                    <Text style={styles.catName}>{item.category}</Text>
                    <Text style={styles.catPercent}>{item.percent}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(item.percent, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.catAmount}>₹ {item.amount}</Text>
                </View>
              ))
            )}
          </View>

          {/* Recent transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {!data || data.recent.length === 0 ? (
              <Text style={styles.empty}>No recent transactions</Text>
            ) : (
              data.recent.map(item => (
                <View key={item.id} style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txItem}>{item.item}</Text>
                    <Text style={styles.txDate}>{item.expense_date}</Text>
                  </View>
                  <Text style={styles.txAmount}>₹ {item.amount}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },

  // Month navigator
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: '#6C63FF', fontWeight: '300' },
  monthPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  monthPillText: { fontSize: 15, fontWeight: '600', color: '#6C63FF' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1A1A2E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#F0F0F5' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#6C63FF' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 14 },
  errorText: { color: '#b71c1c', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  scroll: { padding: 16, gap: 16 },

  // Spend card
  spendCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  spendLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  spendAmount: { color: '#fff', fontSize: 36, fontWeight: '800' },
  spendMonth: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  empty: { color: '#aaa', fontSize: 13 },

  // Category row
  catRow: { gap: 4 },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13, fontWeight: '600', color: '#333' },
  catPercent: { fontSize: 12, color: '#888' },
  barBg: { height: 6, backgroundColor: '#F0EEFF', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: '#6C63FF', borderRadius: 4 },
  catAmount: { fontSize: 12, color: '#555', textAlign: 'right' },

  // Transaction row
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  txLeft: { flex: 1 },
  txItem: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  txDate: { fontSize: 12, color: '#999' },
  txAmount: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
});
