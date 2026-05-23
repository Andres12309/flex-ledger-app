import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatExpenseTime } from '@/src/domain/movements-grouping';
import type { ExpenseListItem } from '@/src/repositories/expenses';
import { formatMoney } from '@/src/utils/currency';

type ExpenseListRowProps = {
  item: ExpenseListItem;
  showTime?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function ExpenseListRow({
  item,
  showTime = true,
  onPress,
  onLongPress,
}: ExpenseListRowProps) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${item.categoryName}, ${formatMoney(item.amountCents)}`}>
      <ThemedView variant="card" style={[styles.row, { borderColor: colors.cardBorder }]}>
        <View style={[styles.dot, { backgroundColor: item.groupColor }]} />
        <View style={styles.rowBody}>
          <ThemedText type="defaultSemiBold">{item.categoryName}</ThemedText>
          <ThemedText type="muted" style={styles.meta}>
            {item.groupName}
            {showTime ? ` · ${formatExpenseTime(item.occurredAt)}` : ''}
          </ThemedText>
          {item.note ? <ThemedText style={styles.note}>{item.note}</ThemedText> : null}
        </View>
        <View style={styles.trailing}>
          <ThemedText type="defaultSemiBold">{formatMoney(item.amountCents)}</ThemedText>
          {onPress ? (
            <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  meta: {
    fontSize: 13,
  },
  note: {
    fontSize: 13,
    opacity: 0.85,
  },
});
