import { format, isSameDay, parseISO, startOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

import type { ExpenseListItem } from '@/src/repositories/expenses';

export type DayExpenseGroup = {
  dayKey: string;
  date: Date;
  label: string;
  isToday: boolean;
  totalCents: number;
  count: number;
  items: ExpenseListItem[];
};

export type MonthMovementsSummary = {
  monthLabel: string;
  totalCents: number;
  transactionCount: number;
  daysWithExpenses: number;
  groups: DayExpenseGroup[];
};

function dayKeyFromMs(ms: number): string {
  return format(startOfDay(new Date(ms)), 'yyyy-MM-dd');
}

export function formatDayLabel(date: Date, reference = new Date()): string {
  if (isSameDay(date, reference)) return 'Hoy';
  if (isSameDay(date, subDays(reference, 1))) return 'Ayer';
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatExpenseTime(ms: number): string {
  return format(new Date(ms), 'HH:mm');
}

export function groupExpensesByDay(
  items: ExpenseListItem[],
  reference = new Date(),
): DayExpenseGroup[] {
  const byDay = new Map<string, ExpenseListItem[]>();

  for (const item of items) {
    const key = dayKeyFromMs(item.occurredAt);
    const bucket = byDay.get(key) ?? [];
    bucket.push(item);
    byDay.set(key, bucket);
  }

  const groups: DayExpenseGroup[] = [];

  for (const [dayKey, dayItems] of byDay) {
    const sortedItems = [...dayItems].sort((a, b) => b.occurredAt - a.occurredAt);
    const date = parseISO(dayKey);
    const totalCents = sortedItems.reduce((sum, row) => sum + row.amountCents, 0);

    groups.push({
      dayKey,
      date,
      label: formatDayLabel(date, reference),
      isToday: isSameDay(date, reference),
      totalCents,
      count: sortedItems.length,
      items: sortedItems,
    });
  }

  return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function filterExpenseListItems(
  items: ExpenseListItem[],
  query: string,
): ExpenseListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter(
    (item) =>
      item.categoryName.toLowerCase().includes(q) ||
      item.groupName.toLowerCase().includes(q) ||
      (item.note?.toLowerCase().includes(q) ?? false),
  );
}

export function buildMonthMovementsSummary(
  items: ExpenseListItem[],
  monthDate = new Date(),
  labelReference = new Date(),
): MonthMovementsSummary {
  const groups = groupExpensesByDay(items, labelReference);
  const monthLabel = format(monthDate, 'MMMM yyyy', { locale: es });

  return {
    monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    totalCents: items.reduce((sum, row) => sum + row.amountCents, 0),
    transactionCount: items.length,
    daysWithExpenses: groups.length,
    groups,
  };
}
