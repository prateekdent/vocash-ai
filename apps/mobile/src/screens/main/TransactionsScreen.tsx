import React from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { ExpenseListItem, ExpenseListResponse } from '../../types/api';

export function TransactionsScreen(): React.JSX.Element {
  const [transactions, setTransactions] = React.useState<ExpenseListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(
    null
  );
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState('');
  const [editCategory, setEditCategory] = React.useState('');
  const [editItem, setEditItem] = React.useState('');
  const [editDate, setEditDate] = React.useState('');

  const [category, setCategory] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const pageSize = 20;

  const fetchTransactions = React.useCallback(
    async (targetPage: number, replace: boolean): Promise<void> => {
      if (replace) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          page_size: pageSize,
        };
        if (category.trim()) {
          params.category = category.trim();
        }
        if (fromDate.trim()) {
          params.from_date = fromDate.trim();
        }
        if (toDate.trim()) {
          params.to_date = toDate.trim();
        }

        const { data } = await apiClient.get<ExpenseListResponse>(
          '/expense/list',
          { params }
        );
        setPage(data.pagination.page);
        setTotal(data.pagination.total);
        setTransactions((prev) =>
          replace ? data.items : [...prev, ...data.items]
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, fromDate, toDate]
  );

  React.useEffect(() => {
    void fetchTransactions(1, true);
  }, [fetchTransactions]);

  const canLoadMore = transactions.length < total;

  const onApplyFilters = (): void => {
    void fetchTransactions(1, true);
  };

  const onLoadMore = (): void => {
    if (!canLoadMore || isLoadingMore) {
      return;
    }
    void fetchTransactions(page + 1, false);
  };

  const startEdit = (item: ExpenseListItem): void => {
    setActionError(null);
    setEditingId(item.id);
    setEditAmount(String(item.amount));
    setEditCategory(item.category);
    setEditItem(item.item);
    setEditDate(item.expense_date);
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditAmount('');
    setEditCategory('');
    setEditItem('');
    setEditDate('');
  };

  const saveEdit = async (item: ExpenseListItem): Promise<void> => {
    if (
      !editAmount.trim() ||
      !editCategory.trim() ||
      !editItem.trim() ||
      !editDate.trim()
    ) {
      setActionError('All edit fields are required');
      return;
    }

    setActionLoadingId(item.id);
    setActionError(null);
    try {
      await apiClient.put(`/expense/${item.id}`, {
        amount: Number(editAmount),
        currency: item.currency ?? 'INR',
        category: editCategory.trim(),
        item: editItem.trim(),
        expense_date: editDate.trim(),
        notes: item.notes ?? null,
        source: item.source,
        raw_transcript: item.raw_transcript ?? null,
      });
      cancelEdit();
      await fetchTransactions(1, true);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteItem = async (item: ExpenseListItem): Promise<void> => {
    setActionLoadingId(item.id);
    setActionError(null);
    try {
      await apiClient.delete(`/expense/${item.id}`);
      if (editingId === item.id) {
        cancelEdit();
      }
      await fetchTransactions(1, true);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator />
          <Text>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Button
            title="Retry"
            onPress={() => void fetchTransactions(1, true)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Transactions</Text>
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="From date (YYYY-MM-DD)"
            value={fromDate}
            onChangeText={setFromDate}
          />
          <TextInput
            style={styles.input}
            placeholder="To date (YYYY-MM-DD)"
            value={toDate}
            onChangeText={setToDate}
          />
          <Button title="Apply Filters" onPress={onApplyFilters} />
        </View>

        {transactions.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.subtitle}>No transactions found.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.row}>
                {editingId === item.id ? (
                  <View style={styles.editBox}>
                    <TextInput
                      style={styles.input}
                      value={editAmount}
                      onChangeText={setEditAmount}
                      placeholder="Amount"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      value={editCategory}
                      onChangeText={setEditCategory}
                      placeholder="Category"
                    />
                    <TextInput
                      style={styles.input}
                      value={editItem}
                      onChangeText={setEditItem}
                      placeholder="Item"
                    />
                    <TextInput
                      style={styles.input}
                      value={editDate}
                      onChangeText={setEditDate}
                      placeholder="YYYY-MM-DD"
                    />
                    <Button
                      title={actionLoadingId === item.id ? 'Saving...' : 'Save'}
                      onPress={() => void saveEdit(item)}
                      disabled={actionLoadingId === item.id}
                    />
                    <Button
                      title="Cancel"
                      onPress={cancelEdit}
                      disabled={actionLoadingId === item.id}
                    />
                  </View>
                ) : (
                  <>
                    <Text style={styles.item}>{item.item}</Text>
                    <Text>{item.category}</Text>
                    <Text>{item.expense_date}</Text>
                    <Text>INR {item.amount}</Text>
                    <View style={styles.actionRow}>
                      <Button
                        title="Edit"
                        onPress={() => startEdit(item)}
                        disabled={Boolean(actionLoadingId)}
                      />
                      <Button
                        title={
                          actionLoadingId === item.id ? 'Deleting...' : 'Delete'
                        }
                        onPress={() => void deleteItem(item)}
                        disabled={Boolean(actionLoadingId)}
                      />
                    </View>
                  </>
                )}
              </View>
            )}
            ListFooterComponent={
              canLoadMore ? (
                <Button
                  title={isLoadingMore ? 'Loading...' : 'Load More'}
                  onPress={onLoadMore}
                  disabled={isLoadingMore}
                />
              ) : (
                <Text style={styles.subtitle}>End of list</Text>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16, gap: 10 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  filters: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  listContent: { gap: 8, paddingBottom: 24 },
  row: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  editBox: { gap: 8 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  item: { fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#666' },
  error: { color: '#b71c1c' },
});
