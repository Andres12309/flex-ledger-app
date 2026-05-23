import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('folder'),
  color: text('color').notNull().default('#0a7ea4'),
  sortOrder: integer('sort_order').notNull().default(0),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  deletedAt: integer('deleted_at'),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  groupId: text('group_id')
    .notNull()
    .references(() => groups.id),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('tag'),
  sortOrder: integer('sort_order').notNull().default(0),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  deletedAt: integer('deleted_at'),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  amountCents: integer('amount_cents').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  note: text('note'),
  occurredAt: integer('occurred_at').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey().default('default'),
  lifecycleType: text('lifecycle_type').notNull().default('daily'),
  currency: text('currency').notNull().default('USD'),
  notificationPrefsJson: text('notification_prefs_json')
    .notNull()
    .default('{"dailyReminder":true,"weeklySummary":true,"budgetAlerts":false}'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  displayName: text('display_name'),
  familyLabel: text('family_label'),
  familySize: integer('family_size'),
  accentThemeId: text('accent_theme_id').notNull().default('teal'),
  expenseCoachSeen: integer('expense_coach_seen', { mode: 'boolean' })
    .notNull()
    .default(false),
  monthlyBudgetCents: integer('monthly_budget_cents'),
});

export type Group = typeof groups.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
