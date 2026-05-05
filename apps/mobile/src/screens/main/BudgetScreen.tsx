import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BudgetCategoryRow } from '../../components/budget/BudgetCategoryRow';
import { SetBudgetModal } from '../../components/budget/SetBudgetModal';
import { TRANSACTION_CATEGORIES } from '../../components/transactions/filterConstants';
import { MonthNavigator } from '../../components/transactions/MonthNavigator';
import type { MainStackParamList } from '../../navigation/types';
import { apiClient } from '../../services/api/client';
import { getApiErrorMessage } from '../../services/api/errors';
import { useAuth } from '../../store/auth/AuthContext';
import type { BudgetStatusItem, BudgetStatusResponse } from '../../types/api';
import { styles } from './BudgetScreen.styles';

type Props = NativeStackScreenProps<MainStackParamList, 'Budget'>;

// "All" is a filter-chip sentinel; budget operates on real categories only.
const BUDGET_CATEGORIES = TRANSACTION_CATEGORIES.filter(c => c !== 'All');

function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// ── Paywall ────────────────────────────────────────────────────────────────────

const PAYWALL_FEATURES = [
  'Limits for all 10 spending categories',
  'Live progress vs. actual spend',
  'Carry limits forward month to month',
] as const;

function ProPaywall({ onUpgrade }: { onUpgrade: () => void }): React.JSX.Element {
  return (
    <View style={styles.paywallContainer}>
      <View style={styles.paywallIconBadge}>
        <Text style={styles.paywallIconText}>₹</Text>
      </View>
      <Text style={styles.paywallTitle}>Budget is a Pro Feature</Text>
      <Text style={styles.paywallSubtitle}>
        Set monthly spending limits per category and track how you're doing in real time.
      </Text>
      <View style={styles.paywallFeatures}>
        {PAYWALL_FEATURES.map(feat => (
          <View key={feat} style={styles.paywallFeatureRow}>
            <Text style={styles.paywallFeatureDot}>•</Text>
            <Text style={styles.paywallFeatureText}>{feat}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade} activeOpacity={0.8}>
        <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export function BudgetScreen({ navigation }: Props): React.JSX.Element {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [statusItems, setStatusItems] = React.useState<BudgetStatusItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal state
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchStatus = React.useCallback(
    async (forDate?: Date): Promise<void> => {
      const target = forDate ?? selectedDate;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get<BudgetStatusResponse>('/budget/status', {
          params: { month: toMonthKey(target) },
        });
        setStatusItems(data.items);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  React.useEffect(() => {
    if (user?.is_pro) {
      void fetchStatus();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Month navigation ────────────────────────────────────────────────────────
  const navigateMonth = (dir: -1 | 1): void => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + dir);
    setSelectedDate(next);
    void fetchStatus(next);
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const openModal = (category: string): void => {
    setActiveCategory(category);
    setSaveError(null);
  };

  const closeModal = (): void => {
    setActiveCategory(null);
    setSaveError(null);
  };

  const handleSave = async (limitAmount: number): Promise<void> => {
    if (!activeCategory) { return; }
    setIsSaving(true);
    setSaveError(null);
    try {
      await apiClient.post('/budget/set', {
        month: toMonthKey(selectedDate),
        category: activeCategory,
        limit_amount: limitAmount,
      });
      closeModal();
      void fetchStatus();
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived rows ────────────────────────────────────────────────────────────
  // Merge API results with full category list so all 10 rows are always shown.
  const rows = React.useMemo(
    () =>
      BUDGET_CATEGORIES.map(cat => {
        const found = statusItems.find(i => i.category === cat);
        return {
          category: cat,
          limitAmount: found?.limit_amount ?? 0,
          spentAmount: found?.spent_amount ?? 0,
        };
      }),
    [statusItems],
  );

  const activeCategoryItem = rows.find(r => r.category === activeCategory);

  // ── Paywall ─────────────────────────────────────────────────────────────────
  if (!user?.is_pro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ProPaywall
          onUpgrade={() => navigation.navigate('Tabs', { screen: 'Profile' })}
        />
      </SafeAreaView>
    );
  }

  // ── Pro UI ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <MonthNavigator date={selectedDate} onNavigate={navigateMonth} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading budget...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => void fetchStatus()}
            style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Limits</Text>
            {rows.map((row, index) => (
              <React.Fragment key={row.category}>
                <BudgetCategoryRow
                  category={row.category}
                  limitAmount={row.limitAmount}
                  spentAmount={row.spentAmount}
                  onPress={() => openModal(row.category)}
                />
                {index < rows.length - 1 && (
                  <View style={styles.rowSeparator} />
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}

      <SetBudgetModal
        visible={activeCategory !== null}
        category={activeCategory ?? ''}
        currentLimit={activeCategoryItem?.limitAmount ?? 0}
        isSaving={isSaving}
        error={saveError}
        onClose={closeModal}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
