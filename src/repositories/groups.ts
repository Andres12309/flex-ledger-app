import * as Crypto from 'expo-crypto';
import { and, asc, count, eq, isNull, sql } from 'drizzle-orm';

import { DEFAULT_GROUP_ICON } from '@/src/constants/group-colors';
import type { AppDatabase } from '@/src/db/client';
import { categories, groups } from '@/src/db/schema';

export type GroupWithCategories = {
  id: string;
  name: string;
  icon: string;
  color: string;
  categories: { id: string; name: string; icon: string }[];
};

export type GroupDetail = GroupWithCategories & {
  sortOrder: number;
  isSystem: boolean;
};

async function createId(): Promise<string> {
  return Crypto.randomUUID();
}

export async function getActiveGroupsWithCategories(
  database: AppDatabase,
): Promise<GroupWithCategories[]> {
  const groupRows = await database
    .select()
    .from(groups)
    .where(isNull(groups.deletedAt))
    .orderBy(asc(groups.sortOrder));

  const result: GroupWithCategories[] = [];

  for (const group of groupRows) {
    const categoryRows = await database
      .select()
      .from(categories)
      .where(and(eq(categories.groupId, group.id), isNull(categories.deletedAt)))
      .orderBy(asc(categories.sortOrder));

    result.push({
      id: group.id,
      name: group.name,
      icon: group.icon,
      color: group.color,
      categories: categoryRows.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
      })),
    });
  }

  return result;
}

export async function getGroupById(
  database: AppDatabase,
  groupId: string,
): Promise<GroupDetail | null> {
  const [group] = await database
    .select()
    .from(groups)
    .where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))
    .limit(1);

  if (!group) return null;

  const categoryRows = await database
    .select()
    .from(categories)
    .where(and(eq(categories.groupId, group.id), isNull(categories.deletedAt)))
    .orderBy(asc(categories.sortOrder));

  return {
    id: group.id,
    name: group.name,
    icon: group.icon,
    color: group.color,
    sortOrder: group.sortOrder,
    isSystem: group.isSystem,
    categories: categoryRows.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
    })),
  };
}

export async function countActiveGroups(database: AppDatabase): Promise<number> {
  const [row] = await database
    .select({ value: count() })
    .from(groups)
    .where(isNull(groups.deletedAt));
  return Number(row?.value ?? 0);
}

export async function countActiveCategoriesInGroup(
  database: AppDatabase,
  groupId: string,
): Promise<number> {
  const [row] = await database
    .select({ value: count() })
    .from(categories)
    .where(and(eq(categories.groupId, groupId), isNull(categories.deletedAt)));
  return Number(row?.value ?? 0);
}

export async function createGroup(
  database: AppDatabase,
  input: { name: string; color: string; initialCategoryName?: string },
): Promise<string> {
  const groupId = await createId();
  const [{ maxOrder }] = await database
    .select({ maxOrder: sql<number>`coalesce(max(${groups.sortOrder}), -1)` })
    .from(groups);

  await database.insert(groups).values({
    id: groupId,
    name: input.name.trim(),
    color: input.color,
    icon: DEFAULT_GROUP_ICON,
    sortOrder: Number(maxOrder) + 1,
    isSystem: false,
  });

  await createCategory(database, {
    groupId,
    name: input.initialCategoryName ?? 'General',
  });

  return groupId;
}

export async function updateGroup(
  database: AppDatabase,
  groupId: string,
  input: { name?: string; color?: string },
): Promise<void> {
  await database
    .update(groups)
    .set({
      ...(input.name != null ? { name: input.name.trim() } : {}),
      ...(input.color != null ? { color: input.color } : {}),
    })
    .where(eq(groups.id, groupId));
}

export async function softDeleteGroup(database: AppDatabase, groupId: string): Promise<void> {
  const active = await countActiveGroups(database);
  if (active <= 1) {
    throw new Error('Debe existir al menos un grupo.');
  }

  const now = Date.now();
  await database.update(groups).set({ deletedAt: now }).where(eq(groups.id, groupId));
  await database
    .update(categories)
    .set({ deletedAt: now })
    .where(eq(categories.groupId, groupId));
}

export async function createCategory(
  database: AppDatabase,
  input: { groupId: string; name: string },
): Promise<string> {
  const id = await createId();
  const [{ maxOrder }] = await database
    .select({ maxOrder: sql<number>`coalesce(max(${categories.sortOrder}), -1)` })
    .from(categories)
    .where(eq(categories.groupId, input.groupId));

  await database.insert(categories).values({
    id,
    groupId: input.groupId,
    name: input.name.trim(),
    icon: 'tag.fill',
    sortOrder: Number(maxOrder) + 1,
    isSystem: false,
  });

  return id;
}

export async function updateCategory(
  database: AppDatabase,
  categoryId: string,
  input: { name: string },
): Promise<void> {
  await database
    .update(categories)
    .set({ name: input.name.trim() })
    .where(eq(categories.id, categoryId));
}

export async function softDeleteCategory(
  database: AppDatabase,
  categoryId: string,
): Promise<void> {
  const [cat] = await database
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!cat) return;

  const countInGroup = await countActiveCategoriesInGroup(database, cat.groupId);
  if (countInGroup <= 1) {
    throw new Error('Cada grupo debe tener al menos una categoría.');
  }

  await database
    .update(categories)
    .set({ deletedAt: Date.now() })
    .where(eq(categories.id, categoryId));
}
