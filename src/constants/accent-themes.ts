export type AccentThemeId = 'teal' | 'violet' | 'amber' | 'rose' | 'blue' | 'emerald';

export type AccentPalette = {
  primary: string;
  primaryDark: string;
  primaryForeground: string;
  glow: string;
};

export const ACCENT_THEMES: Record<
  AccentThemeId,
  AccentPalette & { label: string; emoji: string }
> = {
  teal: {
    label: 'Turquesa',
    emoji: '🌊',
    primary: '#0d9488',
    primaryDark: '#14b8a6',
    primaryForeground: '#ffffff',
    glow: 'rgba(13, 148, 136, 0.35)',
  },
  violet: {
    label: 'Violeta',
    emoji: '✨',
    primary: '#7c3aed',
    primaryDark: '#a78bfa',
    primaryForeground: '#ffffff',
    glow: 'rgba(124, 58, 237, 0.35)',
  },
  amber: {
    label: 'Ámbar',
    emoji: '☀️',
    primary: '#d97706',
    primaryDark: '#fbbf24',
    primaryForeground: '#ffffff',
    glow: 'rgba(217, 119, 6, 0.35)',
  },
  rose: {
    label: 'Rosa',
    emoji: '🌸',
    primary: '#e11d48',
    primaryDark: '#fb7185',
    primaryForeground: '#ffffff',
    glow: 'rgba(225, 29, 72, 0.35)',
  },
  blue: {
    label: 'Azul',
    emoji: '💎',
    primary: '#2563eb',
    primaryDark: '#60a5fa',
    primaryForeground: '#ffffff',
    glow: 'rgba(37, 99, 235, 0.35)',
  },
  emerald: {
    label: 'Esmeralda',
    emoji: '🌿',
    primary: '#059669',
    primaryDark: '#34d399',
    primaryForeground: '#ffffff',
    glow: 'rgba(5, 150, 105, 0.35)',
  },
};

export const ACCENT_THEME_IDS = Object.keys(ACCENT_THEMES) as AccentThemeId[];

export function parseAccentThemeId(value: string | null | undefined): AccentThemeId {
  if (value && value in ACCENT_THEMES) return value as AccentThemeId;
  return 'teal';
}
