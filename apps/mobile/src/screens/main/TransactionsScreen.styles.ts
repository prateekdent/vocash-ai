import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
  summaryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  summaryText: { fontSize: 13, color: '#888', fontWeight: '500' },
  listContent: { paddingBottom: 32, paddingTop: 4 },
  separator: { height: 1, backgroundColor: '#F0F0F5', marginHorizontal: 16 },
  loadMoreIndicator: { paddingVertical: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorText: { color: '#b71c1c', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#aaa', fontSize: 14 },
  endText: { textAlign: 'center', color: '#ccc', fontSize: 12, paddingVertical: 16 },
});
