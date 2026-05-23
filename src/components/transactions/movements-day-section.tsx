import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { SwipeableExpenseRow } from '@/src/components/transactions/swipeable-expense-row';
import type { DayExpenseGroup } from '@/src/domain/movements-grouping';
import type { ExpenseListItem } from '@/src/repositories/expenses';
import { formatMoney } from '@/src/utils/currency';
import { hapticSelection } from '@/src/utils/haptics';

type MovementsDaySectionProps = {
  group: DayExpenseGroup;
  expanded: boolean;
  onToggle: () => void;
  onPressItem: (item: ExpenseListItem) => void;
  onDeleteItem: (item: ExpenseListItem) => void;
};

export function MovementsDaySection({
  group,
  expanded,
  onToggle,
  onPressItem,
  onDeleteItem,
}: MovementsDaySectionProps) {
  const colors = useAppColors();
  const showItems = group.isToday || expanded;
  const collapsible = !group.isToday;

  return (
    <View style={styles.section}>
      {collapsible ? (
        <Pressable
          onPress={() => {
            void hapticSelection();
            onToggle();
          }}
          style={({ pressed }) => [styles.dayHeader, pressed && styles.dayHeaderPressed]}
          accessibilityRole="button"
          accessibilityState={{ expanded }}>
          <View style={styles.dayHeaderLeft}>
            <ThemedText type="defaultSemiBold" style={styles.dayLabel}>
              {group.label}
            </ThemedText>
            <ThemedText type="muted" style={styles.dayMeta}>
              {group.count} {group.count === 1 ? 'gasto' : 'gastos'}
            </ThemedText>
          </View>
          <View style={styles.dayHeaderRight}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>
              {formatMoney(group.totalCents)}
            </ThemedText>
            <IconSymbol
              name={expanded ? 'chevron.up' : 'chevron.down'}
              size={22}
              color={colors.textMuted}
            />
          </View>
        </Pressable>
      ) : (
        <View style={styles.dayHeaderStatic}>
          <View style={styles.dayHeaderLeft}>
            <ThemedText type="defaultSemiBold" style={styles.dayLabel}>
              {group.label}
            </ThemedText>
            <ThemedText type="muted" style={styles.dayMeta}>
              Detalle del día · {group.count} {group.count === 1 ? 'gasto' : 'gastos'}
            </ThemedText>
          </View>
          <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>
            {formatMoney(group.totalCents)}
          </ThemedText>
        </View>
      )}

      {showItems ? (
        <Animated.View entering={FadeInDown.duration(220)} style={styles.items}>
          {group.items.map((item) => (
            <SwipeableExpenseRow
              key={item.id}
              item={item}
              showTime
              onPress={() => onPressItem(item)}
              onDelete={() => onDeleteItem(item)}
            />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  dayHeaderPressed: {
    opacity: 0.75,
  },
  dayHeaderStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    textTransform: 'capitalize',
  },
  dayMeta: {
    fontSize: 13,
  },
  items: {
    gap: 8,
    paddingLeft: 4,
  },
});
