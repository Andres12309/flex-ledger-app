import { getAppColors, type AppColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentTheme } from '@/src/providers/accent-theme-provider';

export function useAppColors(): AppColors {
  try {
    return useAccentTheme().colors;
  } catch {
    const scheme = useColorScheme() ?? 'light';
    return getAppColors(scheme);
  }
}
