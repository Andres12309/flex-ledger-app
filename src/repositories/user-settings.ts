import { eq } from 'drizzle-orm';

import { parseAccentThemeId, type AccentThemeId } from '@/src/constants/accent-themes';
import { serializeNotificationPrefs, parseNotificationPrefs } from '@/src/domain/notifications-policy';
import type { AppDatabase } from '@/src/db/client';
import { userSettings } from '@/src/db/schema';
import type { LifecycleType, NotificationPrefs } from '@/src/types';

const DEFAULT_ID = 'default';

export type UserProfileInput = {
  displayName?: string | null;
  familyLabel?: string | null;
  familySize?: number | null;
};

export type CompleteOnboardingInput = UserProfileInput & {
  accentThemeId: AccentThemeId;
  lifecycleType: LifecycleType;
  currency?: string;
};

export async function getUserSettings(database: AppDatabase) {
  const [row] = await database
    .select()
    .from(userSettings)
    .where(eq(userSettings.id, DEFAULT_ID))
    .limit(1);

  return row ?? null;
}

export async function completeOnboarding(
  database: AppDatabase,
  input: CompleteOnboardingInput,
): Promise<void> {
  await database
    .update(userSettings)
    .set({
      lifecycleType: input.lifecycleType,
      currency: input.currency ?? 'USD',
      displayName: input.displayName?.trim() || null,
      familyLabel: input.familyLabel?.trim() || null,
      familySize: input.familySize ?? null,
      accentThemeId: input.accentThemeId,
      onboardingCompleted: true,
      expenseCoachSeen: false,
    })
    .where(eq(userSettings.id, DEFAULT_ID));
}

/** @deprecated Usar completeOnboarding con perfil y tema. */
export async function completeOnboardingLegacy(
  database: AppDatabase,
  lifecycleType: LifecycleType,
  currency = 'USD',
): Promise<void> {
  await completeOnboarding(database, {
    lifecycleType,
    currency,
    accentThemeId: 'teal',
  });
}

export async function updateLifecycleType(
  database: AppDatabase,
  lifecycleType: LifecycleType,
): Promise<void> {
  await database
    .update(userSettings)
    .set({ lifecycleType })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function updateAccentTheme(
  database: AppDatabase,
  accentThemeId: AccentThemeId,
): Promise<void> {
  await database
    .update(userSettings)
    .set({ accentThemeId })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function updateMonthlyBudget(
  database: AppDatabase,
  monthlyBudgetCents: number | null,
): Promise<void> {
  await database
    .update(userSettings)
    .set({ monthlyBudgetCents: monthlyBudgetCents && monthlyBudgetCents > 0 ? monthlyBudgetCents : null })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function updateUserProfile(
  database: AppDatabase,
  profile: UserProfileInput,
): Promise<void> {
  await database
    .update(userSettings)
    .set({
      displayName: profile.displayName?.trim() || null,
      familyLabel: profile.familyLabel?.trim() || null,
      familySize: profile.familySize ?? null,
    })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function markExpenseCoachSeen(database: AppDatabase): Promise<void> {
  await database
    .update(userSettings)
    .set({ expenseCoachSeen: true })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function updateNotificationPrefs(
  database: AppDatabase,
  prefs: NotificationPrefs,
): Promise<void> {
  await database
    .update(userSettings)
    .set({ notificationPrefsJson: serializeNotificationPrefs(prefs) })
    .where(eq(userSettings.id, DEFAULT_ID));
}

export async function getNotificationPrefs(database: AppDatabase): Promise<NotificationPrefs> {
  const settings = await getUserSettings(database);
  return parseNotificationPrefs(settings?.notificationPrefsJson);
}

export function getAccentFromSettings(
  settings: { accentThemeId?: string | null } | null | undefined,
): AccentThemeId {
  return parseAccentThemeId(settings?.accentThemeId);
}
