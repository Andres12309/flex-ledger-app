import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { useAppColors } from '@/hooks/use-app-colors';
import { useDatabase } from '@/src/providers/database-context';
import { syncScheduledNotifications } from '@/src/services/notifications-scheduler';
import { updateMonthlyBudget } from '@/src/repositories/user-settings';
import { formatMoney } from '@/src/utils/currency';
import { hapticSelection, hapticSuccess } from '@/src/utils/haptics';

const PRESET_CENTS = [50_000, 100_000, 200_000, 500_000, 1_000_000];

type MonthlyBudgetCardProps = {
  monthlyBudgetCents?: number | null;
  currency?: string;
};

function parseBudgetInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const value = parseFloat(cleaned);
  if (Number.isNaN(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function MonthlyBudgetCard({ monthlyBudgetCents, currency = 'USD' }: MonthlyBudgetCardProps) {
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();

  const [input, setInput] = useState(
    monthlyBudgetCents ? String(monthlyBudgetCents / 100) : '',
  );

  useEffect(() => {
    setInput(monthlyBudgetCents ? String(monthlyBudgetCents / 100) : '');
  }, [monthlyBudgetCents]);

  const saveMutation = useMutation({
    mutationFn: (cents: number | null) => updateMonthlyBudget(db, cents),
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await syncScheduledNotifications(db);
    },
  });

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card },
  ];

  return (
    <ThemedView variant="card" style={[styles.card, { borderColor: colors.cardBorder }]}>
      <ThemedText type="subtitle">Presupuesto mensual</ThemedText>
      <ThemedText type="muted" style={styles.hint}>
        Opcional — verás el progreso en Inicio y alertas si lo activas.
      </ThemedText>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Ej. 1500"
        keyboardType="decimal-pad"
        placeholderTextColor={colors.textMuted}
        style={inputStyle}
      />

      <View style={styles.presets}>
        {PRESET_CENTS.map((cents) => {
          const active = monthlyBudgetCents === cents;
          return (
            <Pressable
              key={cents}
              onPress={() => {
                void hapticSelection();
                setInput(String(cents / 100));
                saveMutation.mutate(cents);
              }}
              style={[
                styles.preset,
                { borderColor: colors.cardBorder },
                active && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}>
              <ThemedText
                style={styles.presetText}
                lightColor={active ? colors.primaryForeground : colors.text}
                darkColor={active ? colors.primaryForeground : colors.text}>
                {formatMoney(cents, currency)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Guardar presupuesto"
          loading={saveMutation.isPending}
          onPress={() => saveMutation.mutate(parseBudgetInput(input))}
        />
        {monthlyBudgetCents ? (
          <Pressable
            onPress={() => {
              setInput('');
              saveMutation.mutate(null);
            }}>
            <ThemedText type="link" style={styles.clear}>
              Quitar presupuesto
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  hint: {
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  clear: {
    textAlign: 'center',
    fontSize: 14,
  },
});
