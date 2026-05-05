export type UsageTodayResponse = {
  date: string;
  used: number;
  limit: number;
  is_pro: boolean;
  remaining: number;
};

export type ExpenseListItem = {
  id: string;
  amount: number;
  currency?: string;
  category: string;
  item: string;
  expense_date: string;
  notes?: string | null;
  source: 'voice' | 'manual';
  raw_transcript?: string | null;
};

export type ExpenseListResponse = {
  items: ExpenseListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
};

export type ExpenseExtractResponse = {
  amount: number | string;
  currency: string;
  category: string;
  item: string;
  expense_date: string;
  notes: string | null;
  raw_transcript: string;
};

export type BudgetStatusItem = {
  category: string;
  limit_amount: number;
  spent_amount: number;
  remaining: number;
};

export type BudgetStatusResponse = {
  month: string;
  items: BudgetStatusItem[];
};

export type BudgetSetRequest = {
  month: string;
  category: string;
  limit_amount: number;
};

export type DashboardSummaryResponse = {
  month: string;
  total_spend: number | string;
  currency: string;
  category_breakdown: Array<{
    category: string;
    amount: number | string;
    percent: number;
  }>;
  recent: Array<{
    id: string;
    item: string;
    amount: number | string;
    expense_date: string;
  }>;
};
