import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { GlobalFab } from '@/components/ui/global-fab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExpenseCoachOverlay } from '@/src/components/coach/expense-coach-overlay';
import { useAppColors } from '@/hooks/use-app-colors';

const TAB_BAR_BASE = Platform.OS === 'ios' ? 49 : 56;

export default function TabLayout() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            height: tabBarHeight,
            paddingBottom: insets.bottom,
            paddingTop: 6,
          },
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Movimientos',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="list.bullet" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Ajustes',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
      <GlobalFab />
      <ExpenseCoachOverlay />
    </View>
  );
}
