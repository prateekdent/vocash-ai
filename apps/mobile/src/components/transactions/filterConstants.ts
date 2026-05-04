/**
 * Fixed category list used by the Transactions filter chips.
 * "All" is always the first item and acts as a reset.
 */
export const TRANSACTION_CATEGORIES = [
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
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
