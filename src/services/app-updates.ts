import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export type AppUpdateCheckResult =
  | { status: 'unsupported'; message: string }
  | { status: 'up_to_date'; message: string }
  | { status: 'downloaded'; message: string }
  | { status: 'error'; message: string };

export function isAppUpdatesEnabled(): boolean {
  return !__DEV__ && Updates.isEnabled && Platform.OS !== 'web';
}

export function getAppVersionLabel(): string {
  return Constants.expoConfig?.version ?? '—';
}

export function getUpdateDiagnostics() {
  return {
    version: getAppVersionLabel(),
    runtimeVersion: Updates.runtimeVersion,
    updateId: Updates.updateId,
    channel: Updates.channel,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    enabled: Updates.isEnabled,
  };
}

/** Busca, descarga y opcionalmente reinicia para aplicar la actualización. */
export async function checkForAppUpdate(options?: {
  reloadIfDownloaded?: boolean;
}): Promise<AppUpdateCheckResult> {
  const reloadIfDownloaded = options?.reloadIfDownloaded ?? true;

  if (__DEV__) {
    return {
      status: 'unsupported',
      message: 'En desarrollo no hay actualizaciones OTA. Usa una build de producción.',
    };
  }

  if (!Updates.isEnabled) {
    return {
      status: 'unsupported',
      message:
        'Las actualizaciones remotas no están configuradas en este build. Publica con EAS Update.',
    };
  }

  if (Platform.OS === 'web') {
    return {
      status: 'unsupported',
      message: 'Las actualizaciones OTA no están disponibles en la web.',
    };
  }

  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      return { status: 'up_to_date', message: 'Ya tienes la última versión disponible.' };
    }

    await Updates.fetchUpdateAsync();

    if (reloadIfDownloaded) {
      await Updates.reloadAsync();
    }

    return {
      status: 'downloaded',
      message: 'Actualización descargada. La app se reiniciará…',
    };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'No se pudo buscar actualizaciones.',
    };
  }
}
