import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import type { MonthMovementsSummary } from '@/src/domain/movements-grouping';
import { formatMoney } from '@/src/utils/currency';

type MovementsMonthHeaderProps = {
  summary: MonthMovementsSummary;
};

export function MovementsMonthHeader({ summary }: MovementsMonthHeaderProps) {
  const colors = useAppColors();

  return (
    <ThemedView variant="card" style={[styles.card, { borderColor: colors.cardBorder }]}>
      <ThemedText type="muted" style={styles.caption}>
        {summary.monthLabel}
      </ThemedText>
      <ThemedText type="title" style={styles.total}>
        {formatMoney(summary.totalCents)}
      </ThemedText>
      <View style={styles.stats}>
        <ThemedText type="muted">
          {summary.transactionCount}{' '}
          {summary.transactionCount === 1 ? 'movimiento' : 'movimientos'}
        </ThemedText>
        <ThemedText type="muted">·</ThemedText>
        <ThemedText type="muted">
          {summary.daysWithExpenses}{' '}
          {summary.daysWithExpenses === 1 ? 'día con gastos' : 'días con gastos'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 4,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  total: {
    fontSize: 32,
    lineHeight: 36,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
});
