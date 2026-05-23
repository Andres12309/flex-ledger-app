import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccentThemeProvider } from '@/src/providers/accent-theme-provider';
import { DatabaseProvider } from '@/src/providers/database-provider';
import { FontProvider } from '@/src/providers/font-provider';
import { NotificationsBootstrap } from '@/src/providers/notifications-bootstrap';
import { ToastProvider } from '@/src/providers/toast-provider';
import { UpdatesBootstrap } from '@/src/providers/updates-bootstrap';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <FontProvider>
        <QueryClientProvider client={queryClient}>
          <DatabaseProvider>
            <AccentThemeProvider>
              <ToastProvider>
                <UpdatesBootstrap>
                  <NotificationsBootstrap>{children}</NotificationsBootstrap>
                </UpdatesBootstrap>
              </ToastProvider>
            </AccentThemeProvider>
          </DatabaseProvider>
        </QueryClientProvider>
      </FontProvider>
    </SafeAreaProvider>
  );
}
