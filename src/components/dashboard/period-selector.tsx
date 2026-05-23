import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import type { DashboardPeriod, DashboardPeriodId } from '@/src/types';
import { hapticSelection } from '@/src/utils/haptics';

type PeriodSelectorProps = {
  periods: DashboardPeriod[];
  selectedId: DashboardPeriodId;
  onSelect: (id: DashboardPeriodId) => void;
};

export function PeriodSelector({ periods, selectedId, onSelect }: PeriodSelectorProps) {
  const colors = useAppColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {periods.map((period) => {
        const active = period.id === selectedId;
        return (
          <Pressable
            key={period.id}
            onPress={() => {
              void hapticSelection();
              onSelect(period.id);
            }}>
            <ThemedView
              style={[
                styles.chip,
                { borderColor: colors.cardBorder },
                active && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}>
              <ThemedText
                style={styles.chipText}
                lightColor={active ? colors.primaryForeground : colors.text}
                darkColor={active ? colors.primaryForeground : colors.text}>
                {period.shortLabel}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
