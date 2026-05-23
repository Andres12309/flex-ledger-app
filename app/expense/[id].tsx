import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ModalScreen } from '@/components/ui/modal-screen';
import { SafeCenter } from '@/components/ui/safe-center';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { presetFromOccurredAt } from '@/src/components/expense/expense-date-chips';
import { buildCategoryOptions } from '@/src/components/expense/category-picker';
import {
  ExpenseFormBody,
  getOccurredAtFromForm,
  type ExpenseFormValues,
} from '@/src/components/expense/expense-form-body';
import { useDatabase } from '@/src/providers/database-context';
import { useToast } from '@/src/providers/toast-provider';
import { useDeleteExpenseWithUndo } from '@/src/hooks/use-delete-expense-with-undo';
import {
  getExpenseById,
  getRecentCategoryIds,
  updateExpense,
} from '@/src/repositories/expenses';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';
import { getActiveGroupsWithCategories } from '@/src/repositories/groups';
import { getUserSettings } from '@/src/repositories/user-settings';
import { hapticWarning } from '@/src/utils/haptics';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expenseId = id ?? '';
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const toast = useToast();
  const deleteMutation = useDeleteExpenseWithUndo();

  const expenseQuery = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => getExpenseById(db, expenseId),
    enabled: expenseId.length > 0,
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

  const [form, setForm] = useState<ExpenseFormValues | null>(null);

  const expense = expenseQuery.data;
  const groups = groupsQuery.data ?? [];

  useEffect(() => {
    if (!expense || groups.length === 0) return;
    const group = groups.find((g) => g.categories.some((c) => c.id === expense.categoryId));
    setForm({
      amountCents: expense.amountCents,
      categoryId: expense.categoryId,
      groupId: group?.id ?? null,
      note: expense.note ?? '',
      datePreset: presetFromOccurredAt(expense.occurredAt),
    });
  }, [expenseId, expense, groups]);
  const canSave = form != null && form.amountCents > 0 && form.categoryId != null;

  const selectedCategoryLabel = useMemo(() => {
    if (!form?.categoryId) return null;
    return buildCategoryOptions(groups).find((o) => o.id === form.categoryId)?.name ?? null;
  }, [form?.categoryId, groups]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form?.categoryId || form.amountCents <= 0) {
        throw new Error('Datos incompletos');
      }
      return updateExpense(db, expenseId, {
        amountCents: form.amountCents,
        categoryId: form.categoryId,
        note: form.note.trim() || null,
        occurredAt: getOccurredAtFromForm(form),
      });
    },
    onSuccess: async () => {
      toast.show('Cambios guardados');
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      await queryClient.invalidateQueries({ queryKey: ['engagement'] });
      await syncScheduledNotifications(db);
      router.back();
    },
  });

  const confirmDelete = () => {
    void hapticWarning();
    Alert.alert('Eliminar gasto', '¿Eliminar este movimiento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(expenseId, {
            onSuccess: () => router.back(),
          }),
      },
    ]);
  };

  if (expenseQuery.isLoading || groupsQuery.isLoading || !form) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" />
      </SafeCenter>
    );
  }

  if (!expense) {
    return (
      <SafeCenter>
        <ThemedText>Gasto no encontrado</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Volver</ThemedText>
        </Pressable>
      </SafeCenter>
    );
  }

  const currency = settingsQuery.data?.currency ?? 'USD';

  return (
    <ModalScreen
      title="Editar gasto"
      onClose={() => router.back()}
      footer={
        <View style={styles.footer}>
          <AppButton
            title={
              selectedCategoryLabel
                ? `Guardar · ${selectedCategoryLabel}`
                : 'Guardar cambios'
            }
            loading={saveMutation.isPending}
            disabled={!canSave}
            onPress={() => saveMutation.mutate()}
          />
          <Pressable onPress={confirmDelete} style={styles.delete}>
            <ThemedText style={styles.deleteText}>Eliminar gasto</ThemedText>
          </Pressable>
        </View>
      }>
      <ExpenseFormBody
        groups={groups}
        recentCategoryIds={recentIdsQuery.data ?? []}
        currency={currency}
        initial={{ ...form, occurredAt: expense.occurredAt }}
        onChange={setForm}
      />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: 8,
  },
  delete: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
