import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenShell } from '@/components/ui/screen-shell';

type TabLoadingShellProps = {
  children: ReactNode;
};

/** Carga dentro de tabs: respeta status bar y espacio del FAB/tab bar. */
export function TabLoadingShell({ children }: TabLoadingShellProps) {
  return (
    <ScreenShell scroll={false} bottomInset={96}>
      <View style={styles.center}>{children}</View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
