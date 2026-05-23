export type DashboardPeriodId =
  | 'last7d'
  | 'month'
  | 'quarter'
  | 'semester'
  | 'year';

export type DashboardPeriod = {
  id: DashboardPeriodId;
  label: string;
  shortLabel: string;
};

export type PeriodTotals = {
  totalCents: number;
  transactionCount: number;
  byDay: { date: string; totalCents: number }[];
};

export type LifecycleType = 'per_expense' | 'daily' | 'weekly' | 'paycheck_biweekly' | 'monthly_review';

export type NotificationPrefs = {
  dailyReminder: boolean;
  weeklySummary: boolean;
  budgetAlerts: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  dailyReminder: true,
  weeklySummary: true,
  budgetAlerts: false,
};
