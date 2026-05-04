import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CategoryBreakdownRow } from '../../components/dashboard/CategoryBreakdownRow';
import { DashboardSummaryHeader } from '../../components/dashboard/DashboardSummaryHeader';
import { RecentTransactionRow } from '../../components/dashboard/RecentTransactionRow';
import { SpendingProportionBar } from '../../components/dashboard/SpendingProportionBar';
import { MonthNavigator } from '../../components/transactions/MonthNavigator';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { DashboardSummaryResponse } from '../../types/api';
import { monthLabel } from '../../utils/date';
import { styles } from './DashboardScreen.styles';

type BreakdownItem = DashboardSummaryResponse['category_breakdown'][number];

/**
 * Collapses the raw category breakdown to top-5 by amount,
 * with remaining categories merged into an "Others" bucket.
 */
function buildBreakdown(items: BreakdownItem[]): BreakdownItem[] {
  const sorted = [...items].sort((a, b) => Number(b.amount) - Number(a.amount));
  if (sorted.length <= 5) { return sorted; }
  const top5 = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const othersAmount = rest.reduce((sum, i) => sum + Number(i.amount), 0);
  const othersPercent = rest.reduce((sum, i) => sum + i.percent, 0);
  return [...top5, { category: 'Others', amount: othersAmount, percent: Math.round(othersPercent) }];
}

function dateToMonthParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function DashboardScreen(): React.JSX.Element {
  const today = new Date();

  // ── State ─────────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(today);
  const [data, setData] = React.useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchSummary = React.useCallback(
    async (forDate?: Date): Promise<void> => {
      const target = forDate ?? selectedDate;
      setIsLoading(true);
      setError(null);
      try {
        const { data: response } = await apiClient.get<DashboardSummaryResponse>(
          '/dashboard/summary',
          { params: { month: dateToMonthParam(target) } },
        );
        setData(response);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  React.useEffect(() => {
    void fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Month navigation ──────────────────────────────────────────────────────────
  const navigateMonth = (dir: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + dir);
    setSelectedDate(next);
    void fetchSummary(next);
  };

  // ── Date picker (month selector) ──────────────────────────────────────────────
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

  // ── Derived data ───────────────────────────────────────────────────────────────
  const breakdown = React.useMemo(
    () => buildBreakdown(data?.category_breakdown ?? []),
    [data],
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <MonthNavigator
        date={selectedDate}
        onNavigate={navigateMonth}
        onPillPress={openPicker}
      />

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
              onChange={(event, date) => {
                if (event.type === 'set' && date) { setTempDate(date); }
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
          <TouchableOpacity onPress={() => void fetchSummary()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>
          {/* Hero: summary + proportion bar — single seamless white zone */}
          <View style={styles.heroBlock}>
            <DashboardSummaryHeader
              totalSpend={data?.total_spend ?? 0}
              month={monthLabel(selectedDate)}
              categoryCount={breakdown.length}
            />
            <SpendingProportionBar breakdown={breakdown} />
          </View>

          {/* Category breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {!data || data.category_breakdown.length === 0 ? (
              <Text style={styles.empty}>No category data</Text>
            ) : (
              breakdown.map(item => (
                <CategoryBreakdownRow
                  key={item.category}
                  category={item.category}
                  amount={item.amount}
                  percent={item.percent}
                />
              ))
            )}
          </View>

          {/* Recent transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {!data || data.recent.length === 0 ? (
              <Text style={styles.empty}>No recent transactions</Text>
            ) : (
              data.recent.map((item, index) => (
                <RecentTransactionRow
                  key={item.id}
                  item={item.item}
                  expenseDate={item.expense_date}
                  amount={item.amount}
                  isLast={index === data.recent.length - 1}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
