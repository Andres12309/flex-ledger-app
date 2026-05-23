import * as Notifications from 'expo-notifications';
import { useEffect, type ReactNode } from 'react';

import { useDatabase } from '@/src/providers/database-context';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type NotificationsBootstrapProps = {
  children: ReactNode;
};

export function NotificationsBootstrap({ children }: NotificationsBootstrapProps) {
  const { db, isReady } = useDatabase();

  useEffect(() => {
    if (!isReady) return;
    syncScheduledNotifications(db).catch(() => {
      /* permisos denegados o entorno sin soporte */
    });
  }, [db, isReady]);

  return children;
}
