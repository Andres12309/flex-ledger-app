import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';

type StreakBadgeProps = {
  days: number;
};

export function StreakBadge({ days }: StreakBadgeProps) {
  const colors = useAppColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
      <ThemedText
        style={styles.text}
        lightColor={colors.primaryForeground}
        darkColor={colors.primaryForeground}>
        🔥 {days} {days === 1 ? 'día' : 'días'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
