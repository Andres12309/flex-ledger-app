import { eachDayOfInterval, format, startOfDay } from "date-fns";

import { getPeriodRange } from "@/src/domain/dashboard-periods";
import type { DashboardPeriodId } from "@/src/types";

const MAX_POINTS: Record<DashboardPeriodId, number> = {
  last7d: 7,
  month: 31,
  quarter: 14,
  semester: 14,
  year: 12,
};

export function buildChartSeries(
  periodId: DashboardPeriodId,
  byDay: { date: string; totalCents: number }[],
  now = new Date(),
): { date: string; totalCents: number }[] {
  const range = getPeriodRange(periodId, now);
  const end = new Date(Math.min(range.endMs, now.getTime()));
  const start = startOfDay(new Date(range.startMs));

  const totalsByDate = new Map(byDay.map((d) => [d.date, d.totalCents]));

  let series = eachDayOfInterval({ start, end: startOfDay(end) }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return { date: key, totalCents: totalsByDate.get(key) ?? 0 };
  });

  const limit = MAX_POINTS[periodId];
  if (series.length > limit) {
    series = series.slice(-limit);
  }

  return series;
}

export function getChartHeightScale(series: { totalCents: number }[]): number {
  const nonZero = series.filter((d) => d.totalCents > 0).length;
  if (nonZero <= 1) return 0.42;
  if (nonZero <= 2) return 0.62;
  return 1;
}
