import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ScreenShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  footer?: ReactNode;
  /** Espacio extra bajo el scroll (FAB en tabs, o margen en pantalla completa). */
  bottomInset?: number;
  /**
   * Pantalla completa sin tab bar (onboarding): safe area inferior incluida
   * en el contenedor (no sumar insets.bottom al padding).
   */
  safeBottom?: boolean;
};

export function ScreenShell({
  title,
  subtitle,
  children,
  scroll = true,
  scrollProps,
  footer,
  bottomInset = 80,
  safeBottom = false,
}: ScreenShellProps) {
  const edges: Edge[] = safeBottom
    ? ['top', 'left', 'right', 'bottom']
    : ['top', 'left', 'right'];

  const content = (
    <>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? <ThemedText type="title">{title}</ThemedText> : null}
          {subtitle ? (
            <ThemedText type="muted" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      )}
      {children}
    </>
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
            showsVerticalScrollIndicator={false}
            {...scrollProps}>
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.body, styles.bodyFlex, { paddingBottom: bottomInset }]}>
            {content}
          </View>
        )}
        {footer}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  bodyFlex: {
    flex: 1,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 2,
  },
});
