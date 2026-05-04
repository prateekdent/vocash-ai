import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import type { ExpenseListItem, ExpenseListResponse } from '../../types/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Savings & Investment',
  'Family & Personal',
  'Other',
];

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────
function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function firstDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function lastDay(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function TransactionsScreen(): React.JSX.Element {
  const today = new Date();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(today);
  const [activeCategory, setActiveCategory] = React.useState('All');

  // ── List state ──────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = React.useState<ExpenseListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // ── Edit modal state ────────────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ExpenseListItem | null>(null);
  const [editAmount, setEditAmount] = React.useState('');
  const [editCategory, setEditCategory] = React.useState('');
  const [editItem, setEditItem] = React.useState('');
  const [editDate, setEditDate] = React.useState('');
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchTransactions = React.useCallback(
    async (targetPage: number, replace: boolean, date?: Date, cat?: string): Promise<void> => {
      const forDate = date ?? selectedDate;
      const forCat = cat ?? activeCategory;
      replace ? setIsLoading(true) : setIsLoadingMore(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          page: targetPage,
          page_size: PAGE_SIZE,
          from_date: firstDay(forDate),
          to_date: lastDay(forDate),
        };
        if (forCat !== 'All') {
          params.category = forCat;
        }
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
    [selectedDate, activeCategory]
  );

  React.useEffect(() => {
    void fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Month picker ─────────────────────────────────────────────────────────────
  const openPicker = (): void => {
    setTempDate(selectedDate);
    setPickerVisible(true);
  };

  const confirmPicker = (): void => {
    setSelectedDate(tempDate);
    setActiveCategory('All');
    setPickerVisible(false);
    void fetchTransactions(1, true, tempDate, 'All');
  };

  const cancelPicker = (): void => setPickerVisible(false);

  const navigateMonth = (dir: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + dir);
    setSelectedDate(next);
    setActiveCategory('All');
    void fetchTransactions(1, true, next, 'All');
  };

  // ── Category chip ────────────────────────────────────────────────────────────
  const selectCategory = (cat: string): void => {
    setActiveCategory(cat);
    void fetchTransactions(1, true, selectedDate, cat);
  };

  // ── Load more ────────────────────────────────────────────────────────────────
  const canLoadMore = transactions.length < total;

  const onLoadMore = (): void => {
    if (!canLoadMore || isLoadingMore) return;
    void fetchTransactions(page + 1, false);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (item: ExpenseListItem): void => {
    setEditingItem(item);
    setEditAmount(String(item.amount));
    setEditCategory(item.category);
    setEditItem(item.item);
    setEditDate(item.expense_date);
    setEditError(null);
    setEditModalVisible(true);
  };

  const closeEdit = (): void => {
    setEditModalVisible(false);
    setEditingItem(null);
    setEditError(null);
  };

  const saveEdit = async (): Promise<void> => {
    if (!editingItem) return;
    if (!editAmount.trim() || !editCategory.trim() || !editItem.trim() || !editDate.trim()) {
      setEditError('All fields are required');
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await apiClient.put(`/expense/${editingItem.id}`, {
        amount: Number(editAmount),
        currency: editingItem.currency ?? 'INR',
        category: editCategory.trim(),
        item: editItem.trim(),
        expense_date: editDate.trim(),
        notes: editingItem.notes ?? null,
        source: editingItem.source,
        raw_transcript: editingItem.raw_transcript ?? null,
      });
      closeEdit();
      void fetchTransactions(1, true);
    } catch (err) {
      setEditError(getApiErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const confirmDelete = (item: ExpenseListItem): void => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${item.item}" (₹ ${item.amount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void doDelete(item),
        },
      ]
    );
  };

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

  // ── Render row ────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ExpenseListItem }): React.JSX.Element => {
    const isDeleting = actionLoadingId === item.id;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit(item)}
        activeOpacity={0.7}
        disabled={isDeleting}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowItem} numberOfLines={1}>{item.item}</Text>
          <Text style={styles.rowMeta}>{item.category}  ·  {item.expense_date}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowAmount}>₹ {item.amount}</Text>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#6C63FF" style={{ marginTop: 4 }} />
          ) : (
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────────
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

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>
          {isLoading ? '—' : `${total} transaction${total !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => selectCategory(cat)}>
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Column headers */}
      <View style={styles.colHeader}>
        <Text style={styles.colHeaderText}>Note</Text>
        <Text style={styles.colHeaderText}>Amount</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void fetchTransactions(1, true)} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator color="#6C63FF" style={{ paddingVertical: 16 }} />
            ) : !canLoadMore && transactions.length > 0 ? (
              <Text style={styles.endText}>End of list</Text>
            ) : null
          }
        />
      )}

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
                if (event.type === 'set' && date) setTempDate(date);
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={cancelPicker} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPicker} style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit bottom-sheet modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}>
        <Pressable style={styles.modalBackdrop} onPress={closeEdit}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}>
            <Pressable style={styles.editCard} onPress={() => {}}>
              <View style={styles.editHandle} />
              <Text style={styles.editTitle}>Edit Transaction</Text>

              {editError ? <Text style={styles.editError}>{editError}</Text> : null}

              <View style={styles.editField}>
                <Text style={styles.editLabel}>AMOUNT (₹)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>ITEM</Text>
                <TextInput
                  style={styles.editInput}
                  value={editItem}
                  onChangeText={setEditItem}
                  placeholder="What was it?"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>CATEGORY</Text>
                <TextInput
                  style={styles.editInput}
                  value={editCategory}
                  onChangeText={setEditCategory}
                  placeholder="Category"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>DATE</Text>
                <TextInput
                  style={styles.editInput}
                  value={editDate}
                  onChangeText={setEditDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={closeEdit} style={[styles.modalBtn, styles.cancelBtn]}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void saveEdit()}
                  style={[styles.modalBtn, styles.confirmBtn, editLoading && styles.btnDisabled]}
                  disabled={editLoading}>
                  {editLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.confirmBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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

  // Summary
  summaryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  summaryText: { fontSize: 13, color: '#888', fontWeight: '500' },

  // Chips
  chipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0EEFF',
  },
  chipActive: { backgroundColor: '#6C63FF' },
  chipText: { fontSize: 13, color: '#6C63FF', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  // Column header
  colHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F8FC',
  },
  colHeaderText: { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // List
  listContent: { paddingBottom: 32 },
  separator: { height: 1, backgroundColor: '#F0F0F5', marginHorizontal: 16 },

  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowItem: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 3 },
  rowMeta: { fontSize: 12, color: '#999' },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowAmount: { fontSize: 15, fontWeight: '700', color: '#6C63FF' },
  deleteIcon: { fontSize: 14, opacity: 0.4 },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorText: { color: '#b71c1c', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#aaa', fontSize: 14 },
  endText: { textAlign: 'center', color: '#ccc', fontSize: 12, paddingVertical: 16 },

  // Shared modal
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
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F5' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#6C63FF' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  // Edit modal
  editCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  editHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  editTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' },
  editError: { color: '#b71c1c', fontSize: 13, textAlign: 'center' },
  editField: { gap: 4 },
  editLabel: { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  editInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1A1A2E',
    backgroundColor: '#FAFAFA',
  },
});
