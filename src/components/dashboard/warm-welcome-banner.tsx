import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { StreakBadge } from '@/src/components/dashboard/streak-badge';
import type { DashboardWelcome } from '@/src/domain/engagement';

type WarmWelcomeBannerProps = {
  welcome: DashboardWelcome;
  streak: number;
};

export function WarmWelcomeBanner({ welcome, streak }: WarmWelcomeBannerProps) {
  const colors = useAppColors();

  return (
    <ThemedView
      variant="card"
      style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: `${colors.primary}10` }]}>
      <View style={styles.top}>
        <View style={[styles.emojiWrap, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.emoji}>{welcome.emoji}</ThemedText>
        </View>
        {streak >= 2 ? <StreakBadge days={streak} /> : null}
      </View>
      <ThemedText type="defaultSemiBold" style={styles.message}>
        {welcome.warmMessage}
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
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  message: {
    lineHeight: 22,
    fontSize: 15,
  },
});
