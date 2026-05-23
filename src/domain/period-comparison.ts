import { subDays, subMonths, subYears } from 'date-fns';

import { getPeriodRange, type PeriodRange } from '@/src/domain/dashboard-periods';
import type { DashboardPeriodId } from '@/src/types';

export type PeriodInsight = {
  headline: string;
  detail?: string;
};

/** Rango del período inmediatamente anterior (misma duración lógica). */
export function getPreviousPeriodRange(
  periodId: DashboardPeriodId,
  now = new Date(),
): PeriodRange | null {
  switch (periodId) {
    case 'last7d': {
      const endMs = subDays(now, 7).getTime() - 1;
      const startMs = subDays(now, 13).getTime();
      return { startMs, endMs };
    }
    case 'month':
      return getPeriodRange('month', subMonths(now, 1));
    case 'quarter':
      return getPeriodRange('quarter', subMonths(now, 3));
    case 'semester':
      return getPeriodRange('semester', subMonths(now, 6));
    case 'year':
      return getPeriodRange('year', subYears(now, 1));
    default:
      return null;
  }
}

export function buildPeriodInsight(
  currentCents: number,
  previousCents: number,
  periodShortLabel: string,
  formatDiff: (cents: number) => string,
): PeriodInsight | null {
  if (currentCents === 0 && previousCents === 0) return null;

  if (previousCents === 0) {
    return {
      headline: `Empiezas fuerte en ${periodShortLabel}. Cada registro cuenta.`,
    };
  }

  const diff = currentCents - previousCents;
  const pct = Math.round((diff / previousCents) * 100);
  const diffLabel = diff >= 0 ? `+${formatDiff(diff)}` : `−${formatDiff(Math.abs(diff))}`;

  if (Math.abs(pct) < 5) {
    return {
      headline: `Vas muy parecido al ${periodShortLabel} anterior. Buen ritmo.`,
      detail: `${diffLabel} vs período anterior`,
    };
  }

  if (pct > 0) {
    return {
      headline: `Llevas ${pct}% más que el ${periodShortLabel} anterior.`,
      detail: `${diffLabel} vs período anterior`,
    };
  }

  return {
    headline: `Vas ${Math.abs(pct)}% por debajo del ${periodShortLabel} anterior. ¡Buen control!`,
    detail: `${diffLabel} vs período anterior`,
  };
}

/** @deprecated Usar buildPeriodInsight */
export function buildPeriodInsightMessage(
  currentCents: number,
  previousCents: number,
  periodShortLabel: string,
): string | null {
  return buildPeriodInsight(currentCents, previousCents, periodShortLabel, (c) =>
    String(Math.round(c / 100)),
  )?.headline ?? null;
}

export type BudgetStatus = 'ok' | 'warning' | 'over';

export function getBudgetStatus(spentCents: number, budgetCents: number): BudgetStatus {
  if (budgetCents <= 0) return 'ok';
  const ratio = spentCents / budgetCents;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}
