import { Colors, type AppColorScheme, type AppColors } from '@/constants/theme';
import { ACCENT_THEMES, type AccentThemeId } from '@/src/constants/accent-themes';

export function buildAppColors(scheme: AppColorScheme, accentId: AccentThemeId): AppColors {
  const base = Colors[scheme];
  const accent = ACCENT_THEMES[accentId];
  const primary = scheme === 'dark' ? accent.primaryDark : accent.primary;

  return {
    ...base,
    tint: primary,
    primary,
    primaryForeground: accent.primaryForeground,
    tabIconSelected: primary,
    link: primary,
  };
}
