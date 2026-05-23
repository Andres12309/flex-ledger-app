import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { ACCENT_THEMES, type AccentThemeId } from '@/src/constants/accent-themes';
import { useAccentTheme } from '@/src/providers/accent-theme-provider';

type EmptyStateHeroProps = {
  emoji: string;
  title: string;
  message: string;
  hint?: string;
};

export function EmptyStateHero({ emoji, title, message, hint }: EmptyStateHeroProps) {
  const colors = useAppColors();
  const { accentId } = useAccentTheme();
  const glow = ACCENT_THEMES[accentId as AccentThemeId]?.glow ?? 'rgba(13,148,136,0.2)';

  return (
    <ThemedView
      variant="card"
      style={[styles.card, { borderColor: colors.primary, backgroundColor: glow }]}>
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      </View>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText type="muted" style={styles.message}>
        {message}
      </ThemedText>
      {hint ? (
        <ThemedText type="muted" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 32,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
