import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';

import type { DashboardPeriod, DashboardPeriodId } from '@/src/types';

export const ALL_DASHBOARD_PERIODS: DashboardPeriod[] = [
  { id: 'last7d', label: 'Últimos 7 días', shortLabel: '7 días' },
  { id: 'month', label: 'Este mes', shortLabel: 'Mes' },
  { id: 'quarter', label: 'Últimos 3 meses', shortLabel: '3 meses' },
  { id: 'semester', label: 'Semestre', shortLabel: '6 meses' },
  { id: 'year', label: 'Este año', shortLabel: 'Año' },
];

export type PeriodRange = {
  startMs: number;
  endMs: number;
};

export function getPeriodRange(periodId: DashboardPeriodId, now = new Date()): PeriodRange {
  const endMs = now.getTime();

  switch (periodId) {
    case 'last7d':
      return { startMs: subDays(now, 6).getTime(), endMs };
    case 'month':
      return { startMs: startOfMonth(now).getTime(), endMs: endOfMonth(now).getTime() };
    case 'quarter':
      return { startMs: subMonths(startOfMonth(now), 2).getTime(), endMs };
    case 'semester':
      return { startMs: subMonths(startOfMonth(now), 5).getTime(), endMs };
    case 'year':
      return { startMs: startOfYear(now).getTime(), endMs: endOfYear(now).getTime() };
  }
}

/** Meses distintos (yyyy-MM) con al menos un gasto en el rango. */
export function countDistinctMonths(expenseTimestampsMs: number[], range: PeriodRange): number {
  const months = new Set<string>();

  for (const ts of expenseTimestampsMs) {
    if (ts < range.startMs || ts > range.endMs) continue;
    const d = new Date(ts);
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  return months.size;
}

export function countExpensesInRange(expenseTimestampsMs: number[], range: PeriodRange): number {
  return expenseTimestampsMs.filter((ts) => ts >= range.startMs && ts <= range.endMs).length;
}

export type PeriodVisibilityInput = {
  allExpenseTimestampsMs: number[];
  now?: Date;
};

/**
 * Devuelve solo los períodos que tienen datos suficientes para mostrar un gráfico útil.
 */
export function getVisibleDashboardPeriods(input: PeriodVisibilityInput): DashboardPeriod[] {
  const { allExpenseTimestampsMs, now = new Date() } = input;
  const visible: DashboardPeriod[] = [];

  if (allExpenseTimestampsMs.length === 0) {
    return visible;
  }

  const rules: { periodId: DashboardPeriodId; isVisible: () => boolean }[] = [
    {
      periodId: 'last7d',
      isVisible: () =>
        countExpensesInRange(allExpenseTimestampsMs, getPeriodRange('last7d', now)) >= 1,
    },
    {
      periodId: 'month',
      isVisible: () =>
        countExpensesInRange(allExpenseTimestampsMs, getPeriodRange('month', now)) >= 1,
    },
    {
      periodId: 'quarter',
      isVisible: () =>
        countDistinctMonths(allExpenseTimestampsMs, getPeriodRange('quarter', now)) >= 2,
    },
    {
      periodId: 'semester',
      isVisible: () =>
        countDistinctMonths(allExpenseTimestampsMs, getPeriodRange('semester', now)) >= 3,
    },
    {
      periodId: 'year',
      isVisible: () => {
        const yearRange = getPeriodRange('year', now);
        const monthsInYear = countDistinctMonths(allExpenseTimestampsMs, yearRange);
        const countInYear = countExpensesInRange(allExpenseTimestampsMs, yearRange);
        return monthsInYear >= 4 || countInYear >= 20;
      },
    },
  ];

  for (const rule of rules) {
    if (rule.isVisible()) {
      const period = ALL_DASHBOARD_PERIODS.find((p) => p.id === rule.periodId);
      if (period) visible.push(period);
    }
  }

  return visible;
}

export function getDefaultPeriodId(visible: DashboardPeriod[]): DashboardPeriodId | null {
  if (visible.length === 0) return null;
  const priority: DashboardPeriodId[] = ['last7d', 'month', 'quarter', 'semester', 'year'];
  for (const id of priority) {
    if (visible.some((p) => p.id === id)) return id;
  }
  return visible[0]?.id ?? null;
}
