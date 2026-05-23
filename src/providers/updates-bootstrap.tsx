import * as Updates from 'expo-updates';
import { useEffect, type ReactNode } from 'react';

import { isAppUpdatesEnabled } from '@/src/services/app-updates';

type UpdatesBootstrapProps = {
  children: ReactNode;
};

/**
 * Complementa `updates.checkAutomatically: ON_LOAD`: descarga en segundo plano
 * y reinicia cuando hay una actualización pendiente.
 */
export function UpdatesBootstrap({ children }: UpdatesBootstrapProps) {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (!isAppUpdatesEnabled() || !isUpdateAvailable) return;
    Updates.fetchUpdateAsync().catch(() => {
      /* red sin conexión o rate limit */
    });
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (!isAppUpdatesEnabled() || !isUpdatePending) return;
    Updates.reloadAsync().catch(() => {});
  }, [isUpdatePending]);

  return children;
}
