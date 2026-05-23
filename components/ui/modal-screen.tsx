import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { triggerHaptic } from '@/src/utils/haptics';

type ModalScreenProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Modal a pantalla completa (sin header nativo del Stack).
 * Safe area en los 4 lados — necesario en Android edge-to-edge.
 */
export function ModalScreen({ title, onClose, children, footer }: ModalScreenProps) {
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              triggerHaptic();
              onClose();
            }}
            hitSlop={12}>
            <ThemedText type="link">Cancelar</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">{title}</ThemedText>
          <View style={styles.spacer} />
        </View>
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  spacer: {
    width: 64,
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
});
