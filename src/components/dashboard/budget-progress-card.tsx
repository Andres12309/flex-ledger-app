import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { getBudgetStatus } from '@/src/domain/period-comparison';
import { formatMoney } from '@/src/utils/currency';

type BudgetProgressCardProps = {
  spentCents: number;
  budgetCents: number;
  currency?: string;
};

export function BudgetProgressCard({
  spentCents,
  budgetCents,
  currency = 'USD',
}: BudgetProgressCardProps) {
  const colors = useAppColors();
  const status = getBudgetStatus(spentCents, budgetCents);
  const progress = Math.min(spentCents / budgetCents, 1);
  const remaining = Math.max(budgetCents - spentCents, 0);

  const barColor =
    status === 'over' ? '#dc2626' : status === 'warning' ? '#d97706' : colors.primary;

  const statusText =
    status === 'over'
      ? `Superaste el presupuesto por ${formatMoney(spentCents - budgetCents, currency)}`
      : status === 'warning'
        ? `Cerca del límite · quedan ${formatMoney(remaining, currency)}`
        : `Te quedan ${formatMoney(remaining, currency)} este mes`;

  return (
    <ThemedView variant="card" style={[styles.card, { borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Presupuesto del mes</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: barColor }}>
          {Math.round(progress * 100)}%
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <View style={styles.amounts}>
        <ThemedText type="muted">
          Gastado: {formatMoney(spentCents, currency)}
        </ThemedText>
        <ThemedText type="muted">Meta: {formatMoney(budgetCents, currency)}</ThemedText>
      </View>
      <ThemedText type="muted" style={styles.status}>
        {statusText}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    minWidth: 4,
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
  },
});
