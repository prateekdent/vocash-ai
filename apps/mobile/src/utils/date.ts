export function monthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function firstDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

export function lastDay(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
