import type { AppDatabase } from '@/src/db/client';
import {
  getDefaultPeriodId,
  getVisibleDashboardPeriods,
} from '@/src/domain/dashboard-periods';
import { getAllExpenseTimestamps, getPeriodTotals } from '@/src/repositories/expenses';
import type { DashboardPeriod, DashboardPeriodId, PeriodTotals } from '@/src/types';

export type DashboardSnapshot = {
  visiblePeriods: DashboardPeriod[];
  defaultPeriodId: DashboardPeriodId | null;
  hasAnyExpenses: boolean;
};

export async function loadDashboardSnapshot(database: AppDatabase): Promise<DashboardSnapshot> {
  const timestamps = await getAllExpenseTimestamps(database);
  const visiblePeriods = getVisibleDashboardPeriods({
    allExpenseTimestampsMs: timestamps,
  });

  return {
    visiblePeriods,
    defaultPeriodId: getDefaultPeriodId(visiblePeriods),
    hasAnyExpenses: timestamps.length > 0,
  };
}

export async function loadPeriodTotals(
  database: AppDatabase,
  periodId: DashboardPeriodId,
): Promise<PeriodTotals> {
  return getPeriodTotals(database, periodId);
}
