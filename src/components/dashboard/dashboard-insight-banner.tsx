import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';

type DashboardInsightBannerProps = {
  message: string;
  detail?: string;
};

export function DashboardInsightBanner({ message, detail }: DashboardInsightBannerProps) {
  const colors = useAppColors();

  return (
    <ThemedView
      variant="card"
      style={[styles.card, { borderColor: colors.primary, backgroundColor: `${colors.primary}14` }]}>
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <ThemedText
          style={styles.badgeText}
          lightColor={colors.primaryForeground}
          darkColor={colors.primaryForeground}>
          💡
        </ThemedText>
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Insight
      </ThemedText>
      <ThemedText type="muted" style={styles.message}>
        {message}
      </ThemedText>
      {detail ? (
        <ThemedText type="defaultSemiBold" style={styles.detail}>
          {detail}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
  },
  message: {
    lineHeight: 22,
  },
  detail: {
    fontSize: 15,
    marginTop: 2,
  },
});
