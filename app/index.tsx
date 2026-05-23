import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SafeCenter } from '@/components/ui/safe-center';
import { useOnboardingStatus } from '@/src/hooks/use-onboarding-status';

export default function IndexScreen() {
  const { data: settings, isLoading, isError, error } = useOnboardingStatus();

  if (isLoading) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando…</ThemedText>
      </SafeCenter>
    );
  }

  if (isError) {
    return (
      <SafeCenter>
        <ThemedText type="subtitle">No se pudo iniciar la app</ThemedText>
        <ThemedText type="muted">
          {error instanceof Error ? error.message : 'Error de base de datos'}
        </ThemedText>
      </SafeCenter>
    );
  }

  if (!settings || !settings.onboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
