import * as Crypto from 'expo-crypto';
import { count } from 'drizzle-orm';

import { INITIAL_GROUPS } from '@/src/constants/seed-data';
import type { AppDatabase } from '@/src/db/client';
import { categories, groups, userSettings } from '@/src/db/schema';

async function createId(): Promise<string> {
  return Crypto.randomUUID();
}

export async function seedDatabaseIfEmpty(database: AppDatabase): Promise<void> {
  const [{ value: groupCount }] = await database.select({ value: count() }).from(groups);

  if (groupCount > 0) return;

  for (const [groupIndex, seedGroup] of INITIAL_GROUPS.entries()) {
    const groupId = await createId();
    await database.insert(groups).values({
      id: groupId,
      name: seedGroup.name,
      icon: seedGroup.icon,
      color: seedGroup.color,
      sortOrder: groupIndex,
      isSystem: true,
    });

    for (const [catIndex, seedCategory] of seedGroup.categories.entries()) {
      await database.insert(categories).values({
        id: await createId(),
        groupId,
        name: seedCategory.name,
        icon: seedCategory.icon,
        sortOrder: catIndex,
        isSystem: true,
      });
    }
  }

  await database.insert(userSettings).values({
    id: 'default',
    lifecycleType: 'daily',
    currency: 'USD',
    onboardingCompleted: false,
    accentThemeId: 'teal',
    expenseCoachSeen: false,
  });
}
