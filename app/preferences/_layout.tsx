import { Stack } from 'expo-router';

import { useAppColors } from '@/hooks/use-app-colors';

export default function PreferencesLayout() {
  const colors = useAppColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background, flex: 1 },
      }}>
      <Stack.Screen name="lifecycle" />
    </Stack>
  );
}
