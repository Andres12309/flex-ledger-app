import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { ModalScreen } from '@/components/ui/modal-screen';
import { SafeCenter } from '@/components/ui/safe-center';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import {
  ExpenseFormBody,
  getOccurredAtFromForm,
  type ExpenseFormValues,
} from '@/src/components/expense/expense-form-body';
import { buildCategoryOptions } from '@/src/components/expense/category-picker';
import { useDatabase } from '@/src/providers/database-context';
import { useToast } from '@/src/providers/toast-provider';
import { getStreakToastAfterSave } from '@/src/domain/engagement';
import {
  createExpense,
  getExpenseStreak,
  getRecentCategoryIds,
  getTotalExpenseCount,
} from '@/src/repositories/expenses';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';
import { getActiveGroupsWithCategories } from '@/src/repositories/groups';
import { getUserSettings } from '@/src/repositories/user-settings';

export default function NewExpenseScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [form, setForm] = useState<ExpenseFormValues>({
    amountCents: 0,
    categoryId: null,
    groupId: null,
    note: '',
    datePreset: 'today',
  });

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => getActiveGroupsWithCategories(db),
  });

  const recentIdsQuery = useQuery({
    queryKey: ['expenses', 'recent-category-ids'],
    queryFn: () => getRecentCategoryIds(db),
  });

  const settingsQuery = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettings(db),
  });

  const groups = groupsQuery.data ?? [];
  const canSave = form.amountCents > 0 && form.categoryId != null;

  const selectedCategoryLabel = useMemo(() => {
    if (!form.categoryId) return null;
    const opts = buildCategoryOptions(groups);
    return opts.find((o) => o.id === form.categoryId)?.name ?? null;
  }, [form.categoryId, groups]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.categoryId || form.amountCents <= 0) {
        throw new Error('Monto y categoría son obligatorios');
      }
      const countBefore = await getTotalExpenseCount(db);
      const streakBefore = await getExpenseStreak(db);
      const id = await createExpense(db, {
        amountCents: form.amountCents,
        categoryId: form.categoryId,
        note: form.note.trim() || null,
        occurredAt: getOccurredAtFromForm(form),
      });
      const streakAfter = await getExpenseStreak(db);
      return { countBefore, id, streakBefore, streakAfter };
    },
    onSuccess: async ({ countBefore, streakBefore, streakAfter }) => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['engagement'] });
      await syncScheduledNotifications(db);
      if (countBefore === 0) {
        toast.show('¡Tu primer gasto! Vas genial.', 'celebrate');
      } else {
        const streakMsg = getStreakToastAfterSave(streakBefore, streakAfter);
        if (streakMsg) {
          toast.show(streakMsg, 'celebrate');
        } else {
          toast.show('Gasto guardado');
        }
      }
      router.back();
    },
  });

  if (groupsQuery.isLoading) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" />
      </SafeCenter>
    );
  }

  if (groups.length === 0) {
    return (
      <SafeCenter>
        <ThemedText>No hay categorías disponibles.</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Volver</ThemedText>
        </Pressable>
      </SafeCenter>
    );
  }

  const currency = settingsQuery.data?.currency ?? 'USD';

  return (
    <ModalScreen
      title="Nuevo gasto"
      onClose={() => router.back()}
      footer={
        <AppButton
          title={
            selectedCategoryLabel
              ? `Guardar · ${selectedCategoryLabel}`
              : 'Guardar gasto'
          }
          loading={saveMutation.isPending}
          disabled={!canSave}
          onPress={() => saveMutation.mutate()}
        />
      }>
      <ExpenseFormBody
        groups={groups}
        recentCategoryIds={recentIdsQuery.data ?? []}
        currency={currency}
        initial={form}
        onChange={setForm}
      />
    </ModalScreen>
  );
}
