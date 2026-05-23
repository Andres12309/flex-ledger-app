import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { useAppColors } from '@/hooks/use-app-colors';
import { useDatabase } from '@/src/providers/database-context';
import { updateUserProfile } from '@/src/repositories/user-settings';
import { hapticSuccess } from '@/src/utils/haptics';

type ProfileSettingsCardProps = {
  displayName?: string | null;
  familyLabel?: string | null;
  familySize?: number | null;
};

export function ProfileSettingsCard({
  displayName,
  familyLabel,
  familySize,
}: ProfileSettingsCardProps) {
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();

  const [name, setName] = useState(displayName ?? '');
  const [family, setFamily] = useState(familyLabel ?? '');
  const [size, setSize] = useState(familySize != null ? String(familySize) : '');

  useEffect(() => {
    setName(displayName ?? '');
    setFamily(familyLabel ?? '');
    setSize(familySize != null ? String(familySize) : '');
  }, [displayName, familyLabel, familySize]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const parsed = size.trim() ? parseInt(size, 10) : null;
      return updateUserProfile(db, {
        displayName: name.trim() || null,
        familyLabel: family.trim() || null,
        familySize: parsed && !Number.isNaN(parsed) ? parsed : null,
      });
    },
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card },
  ];

  return (
    <ThemedView variant="card" style={[styles.card, { borderColor: colors.cardBorder }]}>
      <ThemedText type="subtitle">Tu espacio</ThemedText>
      <ThemedText type="muted" style={styles.hint}>
        Opcional — para saludos y sentir la app más tuya.
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre o alias"
        placeholderTextColor={colors.textMuted}
        style={inputStyle}
        maxLength={40}
      />
      <TextInput
        value={family}
        onChangeText={setFamily}
        placeholder="Nombre de familia / hogar"
        placeholderTextColor={colors.textMuted}
        style={inputStyle}
        maxLength={60}
      />
      <TextInput
        value={size}
        onChangeText={setSize}
        placeholder="Personas en el hogar (número)"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        style={inputStyle}
        maxLength={2}
      />
      <AppButton
        title={saveMutation.isPending ? 'Guardando…' : 'Guardar perfil'}
        loading={saveMutation.isPending}
        variant="outline"
        onPress={() => saveMutation.mutate()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  hint: {
    lineHeight: 20,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
});
