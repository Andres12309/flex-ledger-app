import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDatabase } from '@/src/providers/database-context';
import { useToast } from '@/src/providers/toast-provider';
import {
  deleteExpense,
  getExpenseUndoSnapshot,
  restoreExpense,
  type ExpenseUndoSnapshot,
} from '@/src/repositories/expenses';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';

export function useDeleteExpenseWithUndo() {
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const toast = useToast();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    await queryClient.invalidateQueries({ queryKey: ['engagement'] });
    await syncScheduledNotifications(db);
  };

  const restoreMutation = useMutation({
    mutationFn: (snapshot: ExpenseUndoSnapshot) => restoreExpense(db, snapshot),
    onSuccess: async () => {
      toast.show('Gasto restaurado');
      await invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const snapshot = await getExpenseUndoSnapshot(db, expenseId);
      if (!snapshot) throw new Error('Gasto no encontrado');
      await deleteExpense(db, expenseId);
      return snapshot;
    },
    onSuccess: (snapshot) => {
      void invalidateAll();
      toast.showUndo('Gasto eliminado', () => restoreMutation.mutate(snapshot));
    },
  });

  return deleteMutation;
}
