import { usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/hooks/use-app-colors';
import { hapticMedium, triggerHaptic } from '@/src/utils/haptics';

const TAB_BAR_BASE = Platform.OS === 'ios' ? 49 : 56;

function shouldHideFab(pathname: string): boolean {
  if (pathname.includes('expense/')) return true;
  if (pathname.includes('group/new')) return true;
  if (pathname.includes('onboarding')) return true;
  if (pathname.includes('/preferences/')) return true;
  if (/group\/[^/]+/.test(pathname) && !pathname.endsWith('/group/new')) return true;
  return false;
}

export function GlobalFab() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const hidden = shouldHideFab(pathname);
  if (hidden) return null;

  const tabBarTotal = TAB_BAR_BASE + insets.bottom;
  const bottom = tabBarTotal + 16;

  return (
    <View pointerEvents="box-none" style={[styles.layer, { bottom }]}>
      <Pressable
        accessibilityLabel="Registrar nuevo gasto"
        accessibilityRole="button"
        onPress={() => {
          triggerHaptic(hapticMedium);
          router.push('/expense/new');
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderColor: colors.primaryForeground,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
          Platform.OS === 'ios' ? { shadowColor: colors.primary } : null,
        ]}>
        <Text style={[styles.icon, { color: colors.primaryForeground }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    right: 20,
    left: 0,
    alignItems: 'flex-end',
    zIndex: 999,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '200',
    marginTop: -2,
  },
});
