import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import type { CategoryTotal } from '@/src/repositories/expenses';
import { formatMoney } from '@/src/utils/currency';

type TopCategoriesChartProps = {
  items: CategoryTotal[];
  maxItems?: number;
};

export function TopCategoriesChart({ items, maxItems = 5 }: TopCategoriesChartProps) {
  const colors = useAppColors();
  const top = items.slice(0, maxItems);
  const max = Math.max(...top.map((i) => i.totalCents), 1);

  if (top.length === 0) {
    return <ThemedText type="muted">Sin datos por categoría</ThemedText>;
  }

  return (
    <View style={styles.list}>
      {top.map((item) => {
        const widthPct = (item.totalCents / max) * 100;
        return (
          <View key={`${item.categoryName}-${item.groupName}`} style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: item.groupColor }]} />
              <ThemedText type="defaultSemiBold" style={styles.name}>
                {item.categoryName}
              </ThemedText>
              <ThemedText type="muted" style={styles.amount}>
                {formatMoney(item.totalCents)}
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${widthPct}%`, backgroundColor: item.groupColor },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { flex: 1, fontSize: 14 },
  amount: { fontSize: 13 },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
});
