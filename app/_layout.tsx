import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useNavigationTheme } from '@/hooks/use-navigation-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProviders } from '@/src/providers/app-providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const navigationTheme = useNavigationTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProviders>
        <ThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              contentStyle: { flex: 1 },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="expense/new"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="expense/[id]"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen name="group/new" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen
              name="group/[id]"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen name="preferences" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
