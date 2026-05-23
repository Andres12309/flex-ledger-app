import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Pantalla no encontrada</ThemedText>
        <ThemedText type="muted" style={styles.message}>
          Esta ruta no existe en Flex Ledger.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Volver al inicio</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    textAlign: 'center',
  },
  link: {
    marginTop: 8,
  },
});
