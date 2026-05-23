import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import {
  checkForAppUpdate,
  getAppVersionLabel,
  getUpdateDiagnostics,
  isAppUpdatesEnabled,
} from '@/src/services/app-updates';
import { hapticSelection, hapticSuccess } from '@/src/utils/haptics';

export function AppUpdatesCard() {
  const colors = useAppColors();
  const [checking, setChecking] = useState(false);
  const diagnostics = getUpdateDiagnostics();
  const updatesEnabled = isAppUpdatesEnabled();

  const handleCheck = async () => {
    void hapticSelection();
    setChecking(true);
    try {
      const result = await checkForAppUpdate({ reloadIfDownloaded: true });
      if (result.status === 'downloaded') {
        await hapticSuccess();
        return;
      }
      if (result.status === 'up_to_date') {
        await hapticSuccess();
      }
      Alert.alert('Actualizaciones', result.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <ThemedView variant="card" style={[styles.section, { borderColor: colors.cardBorder }]}>
      <ThemedText type="subtitle">Actualizaciones</ThemedText>
      <ThemedText type="muted" style={styles.hint}>
        Versión {getAppVersionLabel()}
        {diagnostics.runtimeVersion ? ` · runtime ${diagnostics.runtimeVersion}` : null}
        {diagnostics.channel ? ` · canal ${diagnostics.channel}` : null}
      </ThemedText>
      {!updatesEnabled ? (
        <ThemedText type="muted" style={styles.hint}>
          {__DEV__
            ? 'En desarrollo no hay OTA. Instala un build EAS (preview o production) para recibir actualizaciones.'
            : 'Las actualizaciones remotas requieren un build EAS reciente con el mismo runtime.'}
        </ThemedText>
      ) : null}

      <Pressable
        style={[styles.checkBtn, { borderColor: colors.primary }]}
        onPress={handleCheck}
        disabled={checking}>
        {checking ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ThemedText type="link" style={styles.checkBtnText}>
            Buscar actualizaciones
          </ThemedText>
        )}
      </Pressable>

      {updatesEnabled && diagnostics.updateId ? (
        <View>
          <ThemedText type="muted" style={styles.meta}>
            {diagnostics.isEmbeddedLaunch ? 'Build integrado' : 'Actualización OTA activa'}
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  hint: {
    lineHeight: 20,
  },
  checkBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  checkBtnText: {
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
});
