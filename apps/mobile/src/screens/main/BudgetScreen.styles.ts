import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FC' },

  // ── Loading / error ───────────────────────────────────────────────────────
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorText: { color: '#b71c1c', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  // ── Content ───────────────────────────────────────────────────────────────
  listContent: { paddingBottom: 32 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    paddingVertical: 10,
  },
  rowSeparator: { height: 1, backgroundColor: '#F0F0F5' },

  // ── Paywall ───────────────────────────────────────────────────────────────
  paywallContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  paywallIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  paywallIconText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#6C63FF',
  },
  paywallTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  paywallFeatures: {
    gap: 8,
    alignSelf: 'stretch',
    paddingHorizontal: 8,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  paywallFeatureDot: {
    fontSize: 16,
    color: '#6C63FF',
    lineHeight: 20,
  },
  paywallFeatureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  upgradeBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
