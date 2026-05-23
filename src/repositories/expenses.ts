import { endOfDay, format, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";

import type { AppDatabase } from "@/src/db/client";
import { categories, expenses, groups } from "@/src/db/schema";
import {
    getPeriodRange,
    type PeriodRange,
} from "@/src/domain/dashboard-periods";
import { computeExpenseStreak } from "@/src/domain/engagement";
import type { DashboardPeriodId, PeriodTotals } from "@/src/types";

export async function getAllExpenseTimestamps(
  database: AppDatabase,
): Promise<number[]> {
  const rows = await database
    .select({ occurredAt: expenses.occurredAt })
    .from(expenses)
    .orderBy(desc(expenses.occurredAt));

  return rows.map((r) => r.occurredAt);
}

export async function getPeriodTotals(
  database: AppDatabase,
  periodId: DashboardPeriodId,
): Promise<PeriodTotals> {
  const range = getPeriodRange(periodId);
  const dayKey = sql<string>`strftime('%Y-%m-%d', ${expenses.occurredAt} / 1000, 'unixepoch', 'localtime')`;

  const [aggregate] = await database
    .select({
      totalCents: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`,
      transactionCount: sql<number>`count(*)`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.occurredAt, range.startMs),
        lte(expenses.occurredAt, range.endMs),
      ),
    );

  const byDayRows = await database
    .select({
      date: dayKey,
      totalCents: sql<number>`sum(${expenses.amountCents})`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.occurredAt, range.startMs),
        lte(expenses.occurredAt, range.endMs),
      ),
    )
    .groupBy(dayKey)
    .orderBy(dayKey);

  return {
    totalCents: Number(aggregate?.totalCents ?? 0),
    transactionCount: Number(aggregate?.transactionCount ?? 0),
    byDay: byDayRows.map((row) => ({
      date: row.date,
      totalCents: Number(row.totalCents),
    })),
  };
}

export type ExpenseListItem = {
  id: string;
  amountCents: number;
  note: string | null;
  occurredAt: number;
  categoryName: string;
  groupName: string;
  groupColor: string;
};

async function selectExpenseListItems(
  database: AppDatabase,
  whereClause?: ReturnType<typeof and>,
  limit?: number,
): Promise<ExpenseListItem[]> {
  let query = database
    .select({
      id: expenses.id,
      amountCents: expenses.amountCents,
      note: expenses.note,
      occurredAt: expenses.occurredAt,
      categoryName: categories.name,
      groupName: groups.name,
      groupColor: groups.color,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .innerJoin(groups, eq(categories.groupId, groups.id))
    .orderBy(desc(expenses.occurredAt))
    .$dynamic();

  if (whereClause) {
    query = query.where(whereClause);
  }
  if (limit != null) {
    query = query.limit(limit);
  }

  return query;
}

export async function getRecentExpenses(
  database: AppDatabase,
  limit = 20,
): Promise<ExpenseListItem[]> {
  return selectExpenseListItems(database, undefined, limit);
}

/** Gastos de un mes calendario (para Movimientos). */
export async function getExpensesForMonth(
  database: AppDatabase,
  reference = new Date(),
): Promise<ExpenseListItem[]> {
  const range = getPeriodRange("month", reference);
  return selectExpenseListItems(
    database,
    and(
      gte(expenses.occurredAt, range.startMs),
      lte(expenses.occurredAt, range.endMs),
    ),
  );
}

export async function getCurrentMonthExpenses(
  database: AppDatabase,
  now = new Date(),
): Promise<ExpenseListItem[]> {
  return getExpensesForMonth(database, now);
}

export type ExpenseDetail = ExpenseListItem & {
  categoryId: string;
};

export async function getExpenseById(
  database: AppDatabase,
  expenseId: string,
): Promise<ExpenseDetail | null> {
  const rows = await database
    .select({
      id: expenses.id,
      amountCents: expenses.amountCents,
      note: expenses.note,
      occurredAt: expenses.occurredAt,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      groupName: groups.name,
      groupColor: groups.color,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .innerJoin(groups, eq(categories.groupId, groups.id))
    .where(eq(expenses.id, expenseId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return row;
}

export type UpdateExpenseInput = {
  amountCents: number;
  categoryId: string;
  note?: string | null;
  occurredAt: number;
};

export async function updateExpense(
  database: AppDatabase,
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<void> {
  await database
    .update(expenses)
    .set({
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      note: input.note?.trim() || null,
      occurredAt: input.occurredAt,
    })
    .where(eq(expenses.id, expenseId));
}

export async function getTotalExpenseCount(
  database: AppDatabase,
): Promise<number> {
  const [row] = await database
    .select({ value: sql<number>`count(*)` })
    .from(expenses);
  return Number(row?.value ?? 0);
}

export type CategoryTotal = {
  categoryName: string;
  groupName: string;
  groupColor: string;
  totalCents: number;
};

export async function getCategoryTotalsForPeriod(
  database: AppDatabase,
  periodId: DashboardPeriodId,
  now = new Date(),
): Promise<CategoryTotal[]> {
  const range = getPeriodRange(periodId, now);
  const rows = await database
    .select({
      categoryName: categories.name,
      groupName: groups.name,
      groupColor: groups.color,
      totalCents: sql<number>`sum(${expenses.amountCents})`,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .innerJoin(groups, eq(categories.groupId, groups.id))
    .where(
      and(
        gte(expenses.occurredAt, range.startMs),
        lte(expenses.occurredAt, range.endMs),
      ),
    )
    .groupBy(categories.id)
    .orderBy(sql`sum(${expenses.amountCents}) desc`);

  return rows.map((r) => ({
    categoryName: r.categoryName,
    groupName: r.groupName,
    groupColor: r.groupColor,
    totalCents: Number(r.totalCents),
  }));
}

export function formatOccurredAt(ms: number): string {
  return format(new Date(ms), "d MMM yyyy, HH:mm");
}

export type CreateExpenseInput = {
  amountCents: number;
  categoryId: string;
  note?: string | null;
  occurredAt?: number;
};

export async function createExpense(
  database: AppDatabase,
  input: CreateExpenseInput,
): Promise<string> {
  const id = await Crypto.randomUUID();
  const now = Date.now();

  await database.insert(expenses).values({
    id,
    amountCents: input.amountCents,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
  });

  return id;
}

export async function hasExpensesToday(
  database: AppDatabase,
  now = new Date(),
): Promise<boolean> {
  const start = startOfDay(now).getTime();
  const end = endOfDay(now).getTime();

  const [row] = await database
    .select({ value: sql<number>`count(*)` })
    .from(expenses)
    .where(and(gte(expenses.occurredAt, start), lte(expenses.occurredAt, end)));

  return Number(row?.value ?? 0) > 0;
}

export type ExpenseExportRow = {
  id: string;
  occurredAt: number;
  amountCents: number;
  note: string | null;
  categoryName: string;
  groupName: string;
  groupColor: string;
};

export async function getAllExpensesForExport(
  database: AppDatabase,
): Promise<ExpenseExportRow[]> {
  const rows = await database
    .select({
      id: expenses.id,
      occurredAt: expenses.occurredAt,
      amountCents: expenses.amountCents,
      note: expenses.note,
      categoryName: categories.name,
      groupName: groups.name,
      groupColor: groups.color,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .innerJoin(groups, eq(categories.groupId, groups.id))
    .orderBy(desc(expenses.occurredAt));

  return rows;
}

export type ExpenseUndoSnapshot = {
  id: string;
  amountCents: number;
  categoryId: string;
  note: string | null;
  occurredAt: number;
  createdAt: number;
};

export async function getExpenseUndoSnapshot(
  database: AppDatabase,
  expenseId: string,
): Promise<ExpenseUndoSnapshot | null> {
  const [row] = await database
    .select({
      id: expenses.id,
      amountCents: expenses.amountCents,
      categoryId: expenses.categoryId,
      note: expenses.note,
      occurredAt: expenses.occurredAt,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .where(eq(expenses.id, expenseId))
    .limit(1);

  return row ?? null;
}

export async function restoreExpense(
  database: AppDatabase,
  snapshot: ExpenseUndoSnapshot,
): Promise<void> {
  await database.insert(expenses).values(snapshot);
}

export async function getTotalCentsForRange(
  database: AppDatabase,
  range: PeriodRange,
): Promise<number> {
  const [row] = await database
    .select({
      totalCents: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`,
    })
    .from(expenses)
    .where(
      and(
        gte(expenses.occurredAt, range.startMs),
        lte(expenses.occurredAt, range.endMs),
      ),
    );

  return Number(row?.totalCents ?? 0);
}

export async function deleteExpense(
  database: AppDatabase,
  expenseId: string,
): Promise<void> {
  await database.delete(expenses).where(eq(expenses.id, expenseId));
}

export async function getRecentCategoryIds(
  database: AppDatabase,
  limit = 5,
): Promise<string[]> {
  const rows = await database
    .select({ categoryId: expenses.categoryId })
    .from(expenses)
    .orderBy(desc(expenses.occurredAt))
    .limit(40);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const row of rows) {
    if (seen.has(row.categoryId)) continue;
    seen.add(row.categoryId);
    result.push(row.categoryId);
    if (result.length >= limit) break;
  }

  return result;
}

export async function getExpenseStreak(
  database: AppDatabase,
  now = new Date(),
): Promise<number> {
  const timestamps = await getAllExpenseTimestamps(database);
  return computeExpenseStreak(timestamps, now);
}
