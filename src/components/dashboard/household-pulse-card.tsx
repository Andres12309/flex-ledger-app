import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import type { HouseholdPulse } from '@/src/domain/engagement';

type HouseholdPulseCardProps = {
  pulse: HouseholdPulse;
};

export function HouseholdPulseCard({ pulse }: HouseholdPulseCardProps) {
  const colors = useAppColors();

  return (
    <ThemedView variant="card" style={[styles.card, { borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <ThemedText style={styles.homeEmoji}>🏠</ThemedText>
        <ThemedText type="subtitle">{pulse.headline}</ThemedText>
      </View>
      <ThemedText type="muted" style={styles.detail}>
        {pulse.detail}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeEmoji: {
    fontSize: 22,
  },
  detail: {
    lineHeight: 20,
    fontSize: 14,
  },
});
