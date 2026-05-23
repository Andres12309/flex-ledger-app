/**
 * Paleta semántica Flex Ledger — consistente en claro y oscuro.
 */

import { Platform } from 'react-native';

const brandPrimary = '#0d9488';
const brandPrimaryDark = '#14b8a6';

export const Colors = {
  light: {
    text: '#0f172a',
    textMuted: '#64748b',
    background: '#f1f5f9',
    card: '#ffffff',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    tint: brandPrimary,
    primary: brandPrimary,
    primaryForeground: '#ffffff',
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: brandPrimary,
    tabBar: '#ffffff',
    tabBarBorder: 'rgba(15, 23, 42, 0.08)',
    destructive: '#dc2626',
    link: brandPrimary,
  },
  dark: {
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    background: '#0f172a',
    card: '#1e293b',
    cardBorder: 'rgba(148, 163, 184, 0.18)',
    tint: brandPrimaryDark,
    primary: brandPrimary,
    primaryForeground: '#ffffff',
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: brandPrimaryDark,
    tabBar: '#1e293b',
    tabBarBorder: 'rgba(148, 163, 184, 0.12)',
    destructive: '#f87171',
    link: brandPrimaryDark,
  },
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = (typeof Colors)['light'];

export function getAppColors(scheme: AppColorScheme): AppColors {
  return Colors[scheme];
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
