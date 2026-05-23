import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { planNotifications, parseNotificationPrefs } from '@/src/domain/notifications-policy';
import type { AppDatabase } from '@/src/db/client';
import { getPeriodTotals, hasExpensesToday } from '@/src/repositories/expenses';
import { getUserSettings } from '@/src/repositories/user-settings';
import type { LifecycleType } from '@/src/types';

const ANDROID_CHANNEL_ID = 'flex-ledger-reminders';

export async function ensureNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
  });
}

export async function syncScheduledNotifications(database: AppDatabase): Promise<void> {
  const granted = await ensureNotificationPermissions();
  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!granted) return;

  const settings = await getUserSettings(database);
  if (!settings?.onboardingCompleted) return;

  const prefs = parseNotificationPrefs(settings.notificationPrefsJson);
  const expensesToday = await hasExpensesToday(database);

  let budgetExceeded = false;
  const budgetCents = settings.monthlyBudgetCents ?? 0;
  if (prefs.budgetAlerts && budgetCents > 0) {
    const monthTotals = await getPeriodTotals(database, 'month');
    budgetExceeded = monthTotals.totalCents > budgetCents;
  }

  const plans = planNotifications({
    lifecycleType: settings.lifecycleType as LifecycleType,
    prefs,
    hasExpensesToday: expensesToday,
    budgetExceeded,
  });

  for (const plan of plans) {
    if (plan.triggerDate <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title: plan.title,
        body: plan.body,
        sound: false,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: plan.triggerDate,
      },
    });
  }
}
