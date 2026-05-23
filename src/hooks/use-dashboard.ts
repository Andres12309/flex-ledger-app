import { useQuery } from '@tanstack/react-query';

import { useDatabase } from '@/src/providers/database-context';
import { loadDashboardSnapshot, loadPeriodTotals } from '@/src/services/dashboard';
import type { DashboardPeriodId } from '@/src/types';

export function useDashboardSnapshot() {
  const { db } = useDatabase();

  return useQuery({
    queryKey: ['dashboard', 'snapshot'],
    queryFn: () => loadDashboardSnapshot(db),
  });
}

export function usePeriodTotals(periodId: DashboardPeriodId | null) {
  const { db } = useDatabase();

  return useQuery({
    queryKey: ['dashboard', 'totals', periodId],
    queryFn: () => {
      if (!periodId) throw new Error('periodId requerido');
      return loadPeriodTotals(db, periodId);
    },
    enabled: periodId != null,
  });
}
