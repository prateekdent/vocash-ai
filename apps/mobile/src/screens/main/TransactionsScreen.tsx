import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './TransactionsScreen.styles';
import { CategoryChips } from '../../components/transactions/CategoryChips';
import {
  EditTransactionModal,
  type EditFormValues,
} from '../../components/transactions/EditTransactionModal';
import { MonthNavigator } from '../../components/transactions/MonthNavigator';
import { TransactionRow } from '../../components/transactions/TransactionRow';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { ExpenseListItem, ExpenseListResponse } from '../../types/api';
import { firstDay, lastDay, monthLabel } from '../../utils/date';

const PAGE_SIZE = 20;

function Separator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

export function TransactionsScreen(): React.JSX.Element {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [activeCategory, setActiveCategory] = React.useState('All');

  // ── List state ──────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = React.useState<ExpenseListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // ── Edit modal state ────────────────────────────────────────────────────────
  const [editingItem, setEditingItem] = React.useState<ExpenseListItem | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchTransactions = React.useCallback(
    async (targetPage: number, replace: boolean, date?: Date): Promise<void> => {
      const forDate = date ?? selectedDate;
      replace ? setIsLoading(true) : setIsLoadingMore(true);
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

  React.useEffect(() => {
    void fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Month navigation ──────────────────────────────────────────────────────────
  const navigateMonth = (dir: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + dir);
    setSelectedDate(next);
    setActiveCategory('All');
    void fetchTransactions(1, true, next);
  };

  // ── Category chips (client-side filter) ──────────────────────────────────────
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(transactions.map(t => t.category))).sort();
    return ['All', ...unique];
  }, [transactions]);

  const displayedTransactions = React.useMemo(() => {
    if (activeCategory === 'All') { return transactions; }
    return transactions.filter(
      t => t.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [transactions, activeCategory]);

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
      void fetchTransactions(1, true);
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (item: ExpenseListItem): void => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${item.item}" (₹ ${item.amount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void doDelete(item) },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ExpenseListItem }): React.JSX.Element => (
    <TransactionRow
      item={item}
      isDeleting={actionLoadingId === item.id}
      onPress={openEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <MonthNavigator date={selectedDate} onNavigate={navigateMonth} />

      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>
          {isLoading
            ? '—'
            : `${total} transaction${total !== 1 ? 's' : ''}${activeCategory !== 'All' ? ` · ${activeCategory}` : ''}`}
        </Text>
      </View>

      <CategoryChips
        categories={categories}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      <View style={styles.colHeader}>
        <Text style={styles.colHeaderText}>Note</Text>
        <Text style={styles.colHeaderText}>Amount</Text>
      </View>

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
      ) : displayedTransactions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {activeCategory !== 'All'
              ? `No "${activeCategory}" transactions found`
              : `No transactions in ${monthLabel(selectedDate)}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedTransactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color="#6C63FF" style={styles.loadMoreIndicator} />
            ) : !canLoadMore && transactions.length > 0 ? (
              <Text style={styles.endText}>End of list</Text>
            ) : null
          }
        />
      )}

      <EditTransactionModal
        visible={editingItem !== null}
        expense={editingItem}
        isSaving={editSaving}
        error={editError}
        onClose={closeEdit}
        onSave={saveEdit}
      />
    </SafeAreaView>
  );
}

