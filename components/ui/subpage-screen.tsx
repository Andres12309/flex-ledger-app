import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { triggerHaptic } from '@/src/utils/haptics';

type SubpageScreenProps = {
  title: string;
  onBack: () => void;
  children: ReactNode;
};

/**
 * Pantalla empujada en Stack sin header nativo.
 * Aplica safe area en los 4 lados (status bar + home indicator en Android edge-to-edge).
 */
export function SubpageScreen({ title, onBack, children }: SubpageScreenProps) {
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              triggerHaptic();
              onBack();
            }}
            hitSlop={12}
            style={styles.backBtn}>
            <ThemedText type="link">Atrás</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <View style={styles.spacer} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    minWidth: 56,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    minWidth: 56,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
});
