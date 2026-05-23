import { endOfDay, isSameDay, startOfDay, subDays } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { hapticSelection } from '@/src/utils/haptics';

export type ExpenseDatePreset = 'today' | 'yesterday';

export function occurredAtFromPreset(preset: ExpenseDatePreset): number {
  const ref = preset === 'today' ? new Date() : subDays(new Date(), 1);
  return ref.getTime();
}

export function presetFromOccurredAt(ms: number): ExpenseDatePreset {
  if (isSameDay(new Date(ms), subDays(new Date(), 1))) return 'yesterday';
  return 'today';
}

type ExpenseDateChipsProps = {
  preset: ExpenseDatePreset;
  onChange: (preset: ExpenseDatePreset) => void;
};

export function ExpenseDateChips({ preset, onChange }: ExpenseDateChipsProps) {
  const colors = useAppColors();
  const options: { id: ExpenseDatePreset; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'yesterday', label: 'Ayer' },
  ];

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = preset === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => {
              void hapticSelection();
              onChange(opt.id);
            }}
            style={[
              styles.chip,
              { borderColor: colors.cardBorder },
              active && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
            <ThemedText
              style={styles.chipText}
              lightColor={active ? colors.primaryForeground : colors.text}
              darkColor={active ? colors.primaryForeground : colors.text}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function isOccurredAtInMonth(ms: number, monthRef: Date): boolean {
  const start = startOfDay(new Date(monthRef.getFullYear(), monthRef.getMonth(), 1)).getTime();
  const end = endOfDay(
    new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0),
  ).getTime();
  return ms >= start && ms <= end;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
