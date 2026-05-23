import { addMonths, format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { hapticSelection } from '@/src/utils/haptics';

type MonthNavigatorProps = {
  monthDate: Date;
  onChange: (date: Date) => void;
  canGoNext?: boolean;
};

export function MonthNavigator({ monthDate, onChange, canGoNext = false }: MonthNavigatorProps) {
  const colors = useAppColors();
  const label = format(monthDate, 'MMMM yyyy', { locale: es });
  const display = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => {
          void hapticSelection();
          onChange(subMonths(monthDate, 1));
        }}
        style={[styles.btn, { borderColor: colors.cardBorder }]}>
        <ThemedText type="defaultSemiBold">‹</ThemedText>
      </Pressable>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {display}
      </ThemedText>
      <Pressable
        onPress={() => {
          if (!canGoNext) return;
          void hapticSelection();
          onChange(addMonths(monthDate, 1));
        }}
        style={[
          styles.btn,
          { borderColor: colors.cardBorder },
          !canGoNext && styles.btnDisabled,
        ]}
        disabled={!canGoNext}>
        <ThemedText type="defaultSemiBold" style={!canGoNext ? styles.muted : undefined}>
          ›
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  muted: {
    opacity: 0.4,
  },
});
