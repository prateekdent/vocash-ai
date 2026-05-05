import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { MainStackParamList } from '../../navigation/types';
import { AddExpenseChooser } from '../../components/transactions/AddExpenseChooser';
import { AddExpenseFab } from '../../components/transactions/AddExpenseFab';
import { ManualExpenseSheet } from '../../components/transactions/ManualExpenseSheet';
import { DaySectionHeader } from '../../components/transactions/DaySectionHeader';
import {
  EditTransactionModal,
  type EditFormValues,
} from '../../components/transactions/EditTransactionModal';
import { LedgerTransactionRow } from '../../components/transactions/LedgerTransactionRow';
import { MonthNavigator } from '../../components/transactions/MonthNavigator';
import { MonthlySummaryStrip } from '../../components/transactions/MonthlySummaryStrip';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { ExpenseListItem, ExpenseListResponse } from '../../types/api';
import { firstDay, lastDay } from '../../utils/date';
import {
  groupTransactionsByDay,
  type DayGroup,
} from '../../utils/groupTransactionsByDay';
import { styles } from './TransactionsScreen.styles';

// Matches the backend's maximum allowed page_size (le=100).
// One fetch covers a full month for typical personal finance usage.
const PAGE_SIZE = 100;

function ItemSeparator(): React.JSX.Element {
  return <View style={styles.itemSeparator} />;
}

type ScreenNav = NativeStackNavigationProp<MainStackParamList>;

export function TransactionsScreen(): React.JSX.Element {
  const navigation = useNavigation<ScreenNav>();

  // Tracks whether the first load has completed; persists across focus/blur.
  const hasLoadedRef = React.useRef<boolean>(false);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // ── List state ───────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = React.useState<ExpenseListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // ── Edit modal state ─────────────────────────────────────────────────────────
  const [editingItem, setEditingItem] = React.useState<ExpenseListItem | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  // ── Add-entry chooser + manual sheet state ───────────────────────────────────
  const [chooserVisible, setChooserVisible] = React.useState(false);
  const [manualVisible, setManualVisible] = React.useState(false);

  // ── Derived data ──────────────────────────────────────────────────────────────
  const groupedSections = React.useMemo<DayGroup[]>(
    () => groupTransactionsByDay(transactions),
    [transactions]
  );

  const monthlyTotal = React.useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const isPartialSummary = transactions.length < total;

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchTransactions = React.useCallback(
    async (targetPage: number, replace: boolean, date?: Date, opts?: { silent?: boolean }): Promise<void> => {
      const forDate = date ?? selectedDate;
      if (replace) {
        if (!opts?.silent) { setIsLoading(true); }
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          page_size: PAGE_SIZE,
          from_date: firstDay(forDate),
          to_date: lastDay(forDate),
        };
        const { data } = await apiClient.get<ExpenseListResponse>('/expense/list', { params });
        setPage(data.pagination.page);
        setTotal(data.pagination.total);
        setTransactions(prev => (replace ? data.items : [...prev, ...data.items]));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedDate]
  );

  // On first focus show the full spinner; on subsequent focuses (tab switches,
  // return from Voice) silently refresh so the existing list stays visible.
  useFocusEffect(
    React.useCallback(() => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        void fetchTransactions(1, true);
      } else {
        void fetchTransactions(1, true, undefined, { silent: true });
      }
    }, [fetchTransactions])
  );

  // ── Entry saved callback (used by ManualExpenseSheet; Voice refresh is via useFocusEffect) ──
  const handleEntrySaved = React.useCallback((): void => {
    void fetchTransactions(1, true);
  }, [fetchTransactions]);

  // ── Month navigation ──────────────────────────────────────────────────────────
  const navigateMonth = (dir: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + dir);
    setSelectedDate(next);
    void fetchTransactions(1, true, next);
  };

  // ── Load more ─────────────────────────────────────────────────────────────────
  const canLoadMore = transactions.length < total;

  const onLoadMore = (): void => {
    if (!canLoadMore || isLoadingMore) { return; }
    void fetchTransactions(page + 1, false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const openEdit = (item: ExpenseListItem): void => {
    setEditingItem(item);
    setEditError(null);
  };

  const closeEdit = (): void => {
    setEditingItem(null);
    setEditError(null);
  };

  const saveEdit = async (values: EditFormValues): Promise<void> => {
    if (!editingItem) { return; }
    const { amount, item, category, date } = values;
    if (!amount.trim() || !category.trim() || !item.trim() || !date.trim()) {
      setEditError('All fields are required');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await apiClient.put(`/expense/${editingItem.id}`, {
        amount: Number(amount),
        currency: editingItem.currency ?? 'INR',
        category: category.trim(),
        item: item.trim(),
        expense_date: date.trim(),
        notes: editingItem.notes ?? null,
        source: editingItem.source,
        raw_transcript: editingItem.raw_transcript ?? null,
      });
      closeEdit();
      void fetchTransactions(1, true);
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const doDelete = async (item: ExpenseListItem): Promise<void> => {
    setActionLoadingId(item.id);
    try {
      await apiClient.delete(`/expense/${item.id}`);
      closeEdit();
      void fetchTransactions(1, true);
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (): void => {
    if (!editingItem) { return; }
    const target = editingItem;
    Alert.alert(
      'Delete Transaction',
      `Delete "${target.item}" (₹ ${target.amount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void doDelete(target) },
      ]
    );
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ExpenseListItem }): React.JSX.Element => (
    <LedgerTransactionRow item={item} onPress={openEdit} />
  );

  const renderSectionHeader = ({ section }: { section: DayGroup }): React.JSX.Element => (
    <DaySectionHeader
      dayNum={section.dayNum}
      weekday={section.weekday}
      total={section.total}
    />
  );

  const listFooter = isLoadingMore ? (
    <ActivityIndicator color="#6C63FF" style={styles.loadMoreIndicator} />
  ) : !canLoadMore && transactions.length > 0 ? (
    <Text style={styles.endText}>End of list</Text>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <MonthNavigator date={selectedDate} onNavigate={navigateMonth} />

      {!isLoading && (
        <MonthlySummaryStrip
          total={monthlyTotal}
          isPartial={isPartialSummary}
        />
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => void fetchTransactions(1, true)}
            style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : groupedSections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No transactions this month</Text>
        </View>
      ) : (
        <SectionList
          sections={groupedSections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={listFooter}
        />
      )}

      <EditTransactionModal
        visible={editingItem !== null}
        expense={editingItem}
        isSaving={editSaving}
        isDeleting={actionLoadingId === editingItem?.id}
        error={editError}
        onClose={closeEdit}
        onSave={saveEdit}
        onDelete={handleDelete}
      />

      <AddExpenseFab onPress={() => setChooserVisible(true)} />

      <ManualExpenseSheet
        visible={manualVisible}
        onClose={() => setManualVisible(false)}
        onSaved={handleEntrySaved}
      />

      <AddExpenseChooser
        visible={chooserVisible}
        onClose={() => setChooserVisible(false)}
        onVoice={() => {
          setChooserVisible(false);
          navigation.navigate('Voice');
        }}
        onManual={() => {
          setChooserVisible(false);
          setManualVisible(true);
        }}
      />
    </SafeAreaView>
  );
}
