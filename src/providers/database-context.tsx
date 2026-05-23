import { createContext, useContext } from 'react';

import type { AppDatabase } from '@/src/db/client';

type DatabaseContextValue = {
  db: AppDatabase;
  isReady: boolean;
};

export const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function useDatabase(): DatabaseContextValue {
  const value = useContext(DatabaseContext);
  if (!value) {
    throw new Error('useDatabase debe usarse dentro de DatabaseProvider');
  }
  return value;
}
