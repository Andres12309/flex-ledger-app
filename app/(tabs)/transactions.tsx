import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isSameMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ListRenderItem, RefreshControl, StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/ui/screen-shell';
import { TabLoadingShell } from '@/components/ui/tab-loading-shell';
import { TransactionsSkeleton } from '@/src/components/dashboard/dashboard-skeleton';
import { EmptyStateHero } from '@/src/components/ui/empty-state-hero';
import { FadeEnter } from '@/src/components/ui/fade-enter';
import { ThemedText } from '@/components/themed-text';
import { MovementsDaySection } from '@/src/components/transactions/movements-day-section';
import { MovementsMonthHeader } from '@/src/components/transactions/movements-month-header';
import { MonthNavigator } from '@/src/components/transactions/month-navigator';
import { TransactionsSearchBar } from '@/src/components/transactions/transactions-search-bar';
import {
  buildMonthMovementsSummary,
  filterExpenseListItems,
} from '@/src/domain/movements-grouping';
import { useDeleteExpenseWithUndo } from '@/src/hooks/use-delete-expense-with-undo';
import { useDatabase } from '@/src/providers/database-context';
import { useAppColors } from '@/hooks/use-app-colors';
import {
  getExpensesForMonth,
  type ExpenseListItem,
} from '@/src/repositories/expenses';
import { formatMoney } from '@/src/utils/currency';
import { hapticLight, hapticWarning } from '@/src/utils/haptics';

type ListRow =
  | { type: 'nav' }
  | { type: 'summary' }
  | { type: 'day'; dayKey: string };

export default function TransactionsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteExpenseWithUndo();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const monthKey = format(monthDate, 'yyyy-MM');
  const isCurrentMonth = isSameMonth(monthDate, new Date());
  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    setExpandedDays(new Set());
    setSearchQuery('');
  }, [monthKey]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expenses', 'month', monthKey],
    queryFn: () => getExpensesForMonth(db, monthDate),
  });

  const filteredItems = useMemo(
    () => filterExpenseListItems(data ?? [], searchQuery),
    [data, searchQuery],
  );

  const summary = useMemo(
    () => buildMonthMovementsSummary(filteredItems, monthDate, new Date()),
    [filteredItems, monthDate],
  );

  useEffect(() => {
    if (!isSearching) return;
    setExpandedDays(new Set(summary.groups.map((g) => g.dayKey)));
  }, [isSearching, searchQuery, summary.groups]);

  const listRows: ListRow[] = useMemo(() => {
    const rows: ListRow[] = [{ type: 'nav' }, { type: 'summary' }];
    for (const group of summary.groups) {
      rows.push({ type: 'day', dayKey: group.dayKey });
    }
    return rows;
  }, [summary.groups]);

  const groupsByKey = useMemo(() => {
    const map = new Map<string, (typeof summary.groups)[number]>();
    for (const g of summary.groups) map.set(g.dayKey, g);
    return map;
  }, [summary.groups]);

  const confirmDelete = (item: ExpenseListItem) => {
    void hapticWarning();
    Alert.alert(
      'Eliminar gasto',
      `¿Eliminar "${item.categoryName}" (${formatMoney(item.amountCents)})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(item.id),
        },
      ],
    );
  };

  const openEdit = (item: ExpenseListItem) => {
    void hapticLight();
    router.push({ pathname: '/expense/[id]', params: { id: item.id } });
  };

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) next.delete(dayKey);
      else next.add(dayKey);
      return next;
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    setRefreshing(false);
  }, [refetch, queryClient]);

  const renderItem: ListRenderItem<ListRow> = ({ item }) => {
    if (item.type === 'nav') {
      return (
        <MonthNavigator
          monthDate={monthDate}
          onChange={setMonthDate}
          canGoNext={!isCurrentMonth}
        />
      );
    }
    if (item.type === 'summary') {
      return <MovementsMonthHeader summary={summary} />;
    }

    const group = groupsByKey.get(item.dayKey);
    if (!group) return null;

    const forceExpanded = isSearching;

    return (
      <MovementsDaySection
        group={group}
        expanded={forceExpanded || expandedDays.has(group.dayKey)}
        onToggle={() => toggleDay(group.dayKey)}
        onPressItem={openEdit}
        onDeleteItem={confirmDelete}
      />
    );
  };

  if (isLoading) {
    return (
      <TabLoadingShell>
        <TransactionsSkeleton />
      </TabLoadingShell>
    );
  }

  const hasItems = (data?.length ?? 0) > 0;
  const hasFilteredItems = filteredItems.length > 0;

  return (
    <ScreenShell
      title="Movimientos"
      subtitle="Toca para editar · desliza para eliminar"
      scroll={false}
      bottomInset={96}>
      {hasItems ? (
        <TransactionsSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={isSearching ? filteredItems.length : undefined}
        />
      ) : null}

      <View style={styles.listWrap}>
        <FadeEnter transitionKey={`${monthKey}-${searchQuery}`}>
          <FlatList
          data={hasFilteredItems ? listRows : hasItems ? [{ type: 'nav' as const }] : [{ type: 'nav' as const }]}
          keyExtractor={(row) =>
            row.type === 'nav' ? 'nav' : row.type === 'summary' ? 'summary' : row.dayKey
          }
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            !hasItems ? (
              <EmptyStateHero
                emoji="📋"
                title="Sin movimientos"
                message={`No hay gastos en ${summary.monthLabel}.`}
                hint="Usa el botón + para registrar uno."
              />
            ) : isSearching && !hasFilteredItems ? (
              <EmptyStateHero
                emoji="🔍"
                title="Sin resultados"
                message={`Nada coincide con "${searchQuery.trim()}".`}
                hint="Prueba con otra palabra o borra la búsqueda."
              />
            ) : null
          }
          ListFooterComponent={
            hasFilteredItems ? (
              <ThemedText type="muted" style={styles.footerHint}>
                Desliza un gasto a la izquierda para eliminar · arrastra hacia abajo para actualizar
              </ThemedText>
            ) : null
          }
          />
        </FadeEnter>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
  list: {
    flex: 1,
    marginHorizontal: -16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
});
