import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { SafeCenter } from '@/components/ui/safe-center';
import { SubpageScreen } from '@/components/ui/subpage-screen';
import { ThemedText } from '@/components/themed-text';
import { LifecyclePicker } from '@/src/components/settings/lifecycle-picker';
import { useDatabase } from '@/src/providers/database-context';
import { getUserSettings, updateLifecycleType } from '@/src/repositories/user-settings';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';
import type { LifecycleType } from '@/src/types';
import { hapticSuccess } from '@/src/utils/haptics';

export default function PreferencesLifecycleScreen() {
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const router = useRouter();

  const settingsQuery = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettings(db),
  });

  const [selected, setSelected] = useState<LifecycleType>('daily');

  useEffect(() => {
    if (settingsQuery.data?.lifecycleType) {
      setSelected(settingsQuery.data.lifecycleType as LifecycleType);
    }
  }, [settingsQuery.data?.lifecycleType]);

  const mutation = useMutation({
    mutationFn: () => updateLifecycleType(db, selected),
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      await syncScheduledNotifications(db);
      router.back();
    },
  });

  if (settingsQuery.isLoading) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" />
      </SafeCenter>
    );
  }

  return (
    <SubpageScreen title="Ciclo de vida" onBack={() => router.back()}>
      <ThemedText type="muted" style={styles.hint}>
        Ajusta cómo y cuándo recibirás recordatorios importantes.
      </ThemedText>
      <LifecyclePicker selected={selected} onSelect={setSelected} />
      <AppButton
        title={mutation.isPending ? 'Guardando…' : 'Guardar'}
        loading={mutation.isPending}
        onPress={() => mutation.mutate()}
        style={styles.button}
      />
    </SubpageScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    lineHeight: 22,
    marginBottom: 4,
  },
  button: {
    marginTop: 4,
  },
});
