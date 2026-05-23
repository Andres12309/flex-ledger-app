import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { ExpenseListRow } from '@/src/components/transactions/expense-list-row';
import type { ExpenseListItem } from '@/src/repositories/expenses';
import { hapticLight } from '@/src/utils/haptics';

type SwipeableExpenseRowProps = {
  item: ExpenseListItem;
  showTime?: boolean;
  onPress: () => void;
  onDelete: () => void;
};

export function SwipeableExpenseRow({
  item,
  showTime = true,
  onPress,
  onDelete,
}: SwipeableExpenseRowProps) {
  const colors = useAppColors();

  const renderRightActions = () => (
    <Pressable
      onPress={onDelete}
      style={[styles.deleteAction, { backgroundColor: '#dc2626' }]}>
      <ThemedText
        style={styles.deleteText}
        lightColor="#fff"
        darkColor="#fff">
        Eliminar
      </ThemedText>
    </Pressable>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => void hapticLight()}>
      <View style={[styles.rowWrap, { backgroundColor: colors.background }]}>
        <ExpenseListRow item={item} showTime={showTime} onPress={onPress} />
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    borderRadius: 12,
  },
  deleteAction: {
    width: 88,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
