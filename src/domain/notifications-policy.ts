import type { LifecycleType, NotificationPrefs } from '@/src/types';
import { DEFAULT_NOTIFICATION_PREFS } from '@/src/types';

export function parseNotificationPrefs(json: string | null | undefined): NotificationPrefs {
  if (!json) return { ...DEFAULT_NOTIFICATION_PREFS };
  try {
    const parsed = JSON.parse(json) as Partial<NotificationPrefs>;
    return {
      dailyReminder: parsed.dailyReminder ?? DEFAULT_NOTIFICATION_PREFS.dailyReminder,
      weeklySummary: parsed.weeklySummary ?? DEFAULT_NOTIFICATION_PREFS.weeklySummary,
      budgetAlerts: parsed.budgetAlerts ?? DEFAULT_NOTIFICATION_PREFS.budgetAlerts,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export function serializeNotificationPrefs(prefs: NotificationPrefs): string {
  return JSON.stringify(prefs);
}

/** Máximo de notificaciones programadas a la vez (evitar spam). */
export const MAX_SCHEDULED_NOTIFICATIONS = 3;

export type PlannedNotification = {
  id: string;
  title: string;
  body: string;
  triggerDate: Date;
};

export function planNotifications(input: {
  lifecycleType: LifecycleType;
  prefs: NotificationPrefs;
  hasExpensesToday: boolean;
  budgetExceeded?: boolean;
  now?: Date;
}): PlannedNotification[] {
  const now = input.now ?? new Date();
  const plans: PlannedNotification[] = [];

  if (input.lifecycleType === 'per_expense') {
    return plans;
  }

  if (
    input.prefs.dailyReminder &&
    (input.lifecycleType === 'daily' || input.lifecycleType === 'paycheck_biweekly') &&
    !input.hasExpensesToday
  ) {
    const trigger = nextDailyAt(now, 20, 0);
    plans.push({
      id: 'daily-reminder',
      title: 'Flex Ledger',
      body: '¿Registraste tus gastos de hoy?',
      triggerDate: trigger,
    });
  }

  if (
    input.prefs.weeklySummary &&
    (input.lifecycleType === 'weekly' || input.lifecycleType === 'daily')
  ) {
    const trigger = nextWeekdayAt(now, 1, 19, 0);
    plans.push({
      id: 'weekly-summary',
      title: 'Resumen semanal',
      body: 'Tu resumen de gastos de la semana está listo para revisar.',
      triggerDate: trigger,
    });
  }

  if (input.prefs.weeklySummary && input.lifecycleType === 'paycheck_biweekly') {
    const trigger = addDays(now, 14);
    trigger.setHours(19, 0, 0, 0);
    if (trigger <= now) trigger.setDate(trigger.getDate() + 14);
    plans.push({
      id: 'biweekly-review',
      title: 'Cierre de quincena',
      body: 'Revisa tus gastos de las últimas dos semanas.',
      triggerDate: trigger,
    });
  }

  if (
    input.prefs.weeklySummary &&
    input.lifecycleType === 'monthly_review'
  ) {
    const trigger = lastDayOfMonthAt(now, 19, 0);
    if (trigger > now) {
      plans.push({
        id: 'monthly-review',
        title: 'Cierre del mes',
        body: 'Es buen momento para revisar tus gastos del mes.',
        triggerDate: trigger,
      });
    } else {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      plans.push({
        id: 'monthly-review',
        title: 'Cierre del mes',
        body: 'Es buen momento para revisar tus gastos del mes.',
        triggerDate: lastDayOfMonthAt(nextMonth, 19, 0),
      });
    }
  }

  if (input.prefs.budgetAlerts && input.budgetExceeded) {
    plans.push({
      id: 'budget-alert',
      title: 'Presupuesto del mes',
      body: 'Superaste tu meta mensual. Revisa tus gastos en Flex Ledger.',
      triggerDate: nextDailyAt(now, 9, 0),
    });
  }

  return plans.slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}

function nextDailyAt(from: Date, hour: number, minute: number): Date {
  const d = new Date(from);
  d.setHours(hour, minute, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}

/** weekday 1 = domingo (convención Expo). */
function nextWeekdayAt(from: Date, weekday: number, hour: number, minute: number): Date {
  const d = new Date(from);
  d.setHours(hour, minute, 0, 0);
  const current = d.getDay() + 1;
  let delta = weekday - current;
  if (delta < 0 || (delta === 0 && d <= from)) delta += 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function lastDayOfMonthAt(from: Date, hour: number, minute: number): Date {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 0);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}
