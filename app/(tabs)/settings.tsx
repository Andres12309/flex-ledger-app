import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ScreenShell } from '@/components/ui/screen-shell';
import { TabLoadingShell } from '@/components/ui/tab-loading-shell';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { AppUpdatesCard } from '@/src/components/settings/app-updates-card';
import { AccentThemePicker } from '@/src/components/settings/accent-theme-picker';
import { MonthlyBudgetCard } from '@/src/components/settings/monthly-budget-card';
import { ProfileSettingsCard } from '@/src/components/settings/profile-settings-card';
import { parseAccentThemeId } from '@/src/constants/accent-themes';
import { parseNotificationPrefs } from '@/src/domain/notifications-policy';
import { useAccentTheme } from '@/src/providers/accent-theme-provider';
import { useDatabase } from '@/src/providers/database-context';
import { getActiveGroupsWithCategories } from '@/src/repositories/groups';
import {
  getNotificationPrefs,
  getUserSettings,
  updateNotificationPrefs,
} from '@/src/repositories/user-settings';
import { exportExpensesToXlsx } from '@/src/services/export-xlsx';
import {
  ensureNotificationPermissions,
  syncScheduledNotifications,
} from '@/src/services/notifications-scheduler';
import type { NotificationPrefs } from '@/src/types';
import { hapticSelection, hapticSuccess } from '@/src/utils/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();
  const { accentId, setAccentId } = useAccentTheme();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => getActiveGroupsWithCategories(db),
  });

  const settingsQuery = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettings(db),
  });

  const prefsQuery = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () => getNotificationPrefs(db),
  });

  const [exporting, setExporting] = useState(false);

  const prefsMutation = useMutation({
    mutationFn: (prefs: NotificationPrefs) => updateNotificationPrefs(db, prefs),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
      await syncScheduledNotifications(db);
    },
  });

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    void hapticSelection();
    const current = prefsQuery.data ?? parseNotificationPrefs(settingsQuery.data?.notificationPrefsJson);
    prefsMutation.mutate({ ...current, [key]: value });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportExpensesToXlsx(db);
      await hapticSuccess();
    } catch (err) {
      Alert.alert(
        'Exportación',
        err instanceof Error ? err.message : 'No se pudo exportar el archivo',
      );
    } finally {
      setExporting(false);
    }
  };

  const handleEnableNotifications = async () => {
    const ok = await ensureNotificationPermissions();
    if (ok) {
      await syncScheduledNotifications(db);
      Alert.alert('Listo', 'Recordatorios configurados según tu ciclo de vida.');
    } else {
      Alert.alert('Permisos', 'Activa las notificaciones en ajustes del sistema.');
    }
  };

  if (groupsQuery.isLoading || settingsQuery.isLoading) {
    return (
      <TabLoadingShell>
        <ActivityIndicator size="large" color={colors.primary} />
      </TabLoadingShell>
    );
  }

  const groups = groupsQuery.data ?? [];
  const prefs = prefsQuery.data;

  const settings = settingsQuery.data;

  return (
    <ScreenShell title="Ajustes" bottomInset={96}>
      <ProfileSettingsCard
        displayName={settings?.displayName}
        familyLabel={settings?.familyLabel}
        familySize={settings?.familySize}
      />

      <MonthlyBudgetCard
        monthlyBudgetCents={settings?.monthlyBudgetCents}
        currency={settings?.currency ?? 'USD'}
      />

      <ThemedView variant="card" style={[styles.section, { borderColor: colors.cardBorder }]}>
        <ThemedText type="subtitle">Color de la app</ThemedText>
        <ThemedText type="muted" style={styles.hint}>
          Elige el tono que más te guste. Se aplica al instante.
        </ThemedText>
        <AccentThemePicker
          selected={parseAccentThemeId(settings?.accentThemeId ?? accentId)}
          onSelect={(id) => void setAccentId(id)}
        />
      </ThemedView>

      <View style={styles.sectionHeader}>
        <ThemedText type="defaultSemiBold">Grupos y categorías</ThemedText>
        <Link href="/group/new" asChild>
          <Pressable style={[styles.smallBtn, { backgroundColor: colors.primary }]}>
            <ThemedText
              style={styles.smallBtnText}
              lightColor={colors.primaryForeground}
              darkColor={colors.primaryForeground}>
              + Grupo
            </ThemedText>
          </Pressable>
        </Link>
      </View>

      {groups.map((group) => (
        <Pressable
          key={group.id}
          onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })}>
          <ThemedView variant="card" style={[styles.groupCard, { borderColor: colors.cardBorder }]}>
            <ThemedText type="defaultSemiBold" style={{ color: group.color }}>
              {group.name}
            </ThemedText>
            <ThemedText style={styles.categories}>
              {group.categories.map((c) => c.name).join(' · ')}
            </ThemedText>
            <ThemedText type="muted" style={styles.editHint}>
              Toca para editar
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}

      <ThemedView variant="card" style={[styles.section, { borderColor: colors.cardBorder }]}>
        <ThemedText type="subtitle">Ciclo de vida</ThemedText>
        <ThemedText>Actual: {settingsQuery.data?.lifecycleType ?? '—'}</ThemedText>
        <Pressable onPress={() => router.push('/preferences/lifecycle')}>
          <ThemedText type="link">Cambiar ciclo de vida</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView variant="card" style={[styles.section, { borderColor: colors.cardBorder }]}>
        <ThemedText type="subtitle">Notificaciones</ThemedText>
        <ThemedText type="muted" style={styles.hint}>
          Solo recordatorios útiles (máx. 3). Se reprograman al abrir la app.
        </ThemedText>

        <View style={styles.switchRow}>
          <ThemedText>Recordatorio diario</ThemedText>
          <Switch
            value={prefs?.dailyReminder ?? true}
            onValueChange={(v) => updatePref('dailyReminder', v)}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <ThemedText>Resumen semanal</ThemedText>
          <Switch
            value={prefs?.weeklySummary ?? true}
            onValueChange={(v) => updatePref('weeklySummary', v)}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <ThemedText>Alertas de presupuesto</ThemedText>
            <ThemedText type="muted" style={styles.switchHint}>
              Si superas tu meta mensual (requiere presupuesto configurado)
            </ThemedText>
          </View>
          <Switch
            value={prefs?.budgetAlerts ?? false}
            onValueChange={(v) => updatePref('budgetAlerts', v)}
            trackColor={{ true: colors.primary }}
          />
        </View>

        <Pressable onPress={handleEnableNotifications}>
          <ThemedText type="link">Activar permisos de notificaciones</ThemedText>
        </Pressable>
      </ThemedView>

      <AppUpdatesCard />

      <ThemedView variant="card" style={[styles.section, { borderColor: colors.cardBorder }]}>
        <ThemedText type="subtitle">Datos</ThemedText>
        <ThemedText>Moneda: {settingsQuery.data?.currency ?? 'USD'}</ThemedText>
        <Pressable
          style={[styles.exportBtn, { borderColor: colors.primary }]}
          onPress={handleExport}
          disabled={exporting}>
          {exporting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <ThemedText type="link" style={{ fontWeight: '600' }}>
              Exportar a Excel (.xlsx)
            </ThemedText>
          )}
        </Pressable>
        <ThemedText type="muted" style={styles.exportHint}>
          Incluye gastos, resúmenes por categoría, grupo, mes e información del reporte.
        </ThemedText>
      </ThemedView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  groupCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  categories: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  editHint: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    gap: 2,
  },
  switchHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  exportBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 4,
  },
  exportHint: {
    lineHeight: 18,
  },
});
