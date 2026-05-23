import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export const FONT_REGULAR = 'PlusJakartaSans_400Regular';
export const FONT_MEDIUM = 'PlusJakartaSans_500Medium';
export const FONT_SEMIBOLD = 'PlusJakartaSans_600SemiBold';
export const FONT_BOLD = 'PlusJakartaSans_700Bold';

type FontProviderProps = {
  children: ReactNode;
};

export function FontProvider({ children }: FontProviderProps) {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
