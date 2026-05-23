import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import migrations from '@/drizzle/migrations';
import { db } from '@/src/db/client';
import { seedDatabaseIfEmpty } from '@/src/db/seed';
import { DatabaseContext } from '@/src/providers/database-context';
import { ThemedText } from '@/components/themed-text';
import { SafeCenter } from '@/components/ui/safe-center';

type DatabaseProviderProps = {
  children: ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success || seeded) return;

    seedDatabaseIfEmpty(db)
      .then(() => setSeeded(true))
      .catch((err: unknown) => {
        setSeedError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [success, seeded]);

  if (error) {
    return (
      <SafeCenter>
        <ThemedText type="subtitle">Error de base de datos</ThemedText>
        <ThemedText>{error.message}</ThemedText>
      </SafeCenter>
    );
  }

  if (seedError) {
    return (
      <SafeCenter>
        <ThemedText type="subtitle">Error al inicializar datos</ThemedText>
        <ThemedText>{seedError.message}</ThemedText>
      </SafeCenter>
    );
  }

  if (!success || !seeded) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Preparando Flex Ledger…</ThemedText>
      </SafeCenter>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, isReady: true }}>{children}</DatabaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
  },
});
