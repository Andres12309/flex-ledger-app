import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AppColors } from '@/constants/theme';
import { parseAccentThemeId, type AccentThemeId } from '@/src/constants/accent-themes';
import { buildAppColors } from '@/src/domain/app-colors';
import { useDatabase } from '@/src/providers/database-context';
import { getUserSettings, updateAccentTheme } from '@/src/repositories/user-settings';

type AccentThemeContextValue = {
  accentId: AccentThemeId;
  colors: AppColors;
  setAccentId: (id: AccentThemeId) => Promise<void>;
  isReady: boolean;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const { db, isReady: dbReady } = useDatabase();
  const scheme = useColorScheme() ?? 'light';
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettings(db),
    enabled: dbReady,
  });

  const accentId = parseAccentThemeId(settingsQuery.data?.accentThemeId);

  const colors = useMemo(() => buildAppColors(scheme, accentId), [scheme, accentId]);

  const setAccentId = useCallback(
    async (id: AccentThemeId) => {
      await updateAccentTheme(db, id);
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
    [db, queryClient],
  );

  const value = useMemo(
    () => ({
      accentId,
      colors,
      setAccentId,
      isReady: dbReady && !settingsQuery.isLoading,
    }),
    [accentId, colors, setAccentId, dbReady, settingsQuery.isLoading],
  );

  return (
    <AccentThemeContext.Provider value={value}>{children}</AccentThemeContext.Provider>
  );
}

export function useAccentTheme(): AccentThemeContextValue {
  const ctx = useContext(AccentThemeContext);
  if (!ctx) {
    throw new Error('useAccentTheme debe usarse dentro de AccentThemeProvider');
  }
  return ctx;
}
