import type { ExpenseListItem } from '../types/api';

export type DayGroup = {
  /** ISO date string — doubles as SectionList section key */
  dateKey: string;
  dayNum: number;
  weekday: string;
  total: number;
  data: ExpenseListItem[];
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Groups a flat list of expenses into day buckets sorted newest-first.
 * Handles malformed date strings gracefully (skips bad entries).
 */
export function groupTransactionsByDay(items: ExpenseListItem[]): DayGroup[] {
  const map = new Map<string, DayGroup>();

  for (const item of items) {
    const dateKey = item.expense_date;
    const parts = dateKey.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) { continue; }

    const [year, month, day] = parts;
    if (!map.has(dateKey)) {
      const date = new Date(year, month - 1, day);
      map.set(dateKey, {
        dateKey,
        dayNum: day,
        weekday: WEEKDAYS[date.getDay()] ?? '?',
        total: 0,
        data: [],
      });
    }

    const group = map.get(dateKey)!;
    group.total += Number(item.amount);
    group.data.push(item);
  }

  return Array.from(map.values()).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );
}
