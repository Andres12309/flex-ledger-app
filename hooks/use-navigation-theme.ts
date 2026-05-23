import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { useAppColors } from '@/hooks/use-app-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useNavigationTheme(): Theme {
  const scheme = useColorScheme() ?? 'light';
  const c = useAppColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.card,
      text: c.text,
      border: c.cardBorder,
      notification: c.primary,
    },
  };
}
