import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ModalScreen } from '@/components/ui/modal-screen';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useAppColors } from '@/hooks/use-app-colors';
import { GROUP_COLOR_PRESETS } from '@/src/constants/group-colors';
import { useDatabase } from '@/src/providers/database-context';
import { createGroup } from '@/src/repositories/groups';
import { hapticSelection, hapticSuccess } from '@/src/utils/haptics';

export default function NewGroupScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(GROUP_COLOR_PRESETS[0] as string);

  const mutation = useMutation({
    mutationFn: () => createGroup(db, { name, color }),
    onSuccess: async (groupId) => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.replace({ pathname: '/group/[id]', params: { id: groupId } });
    },
  });

  const canSave = name.trim().length >= 2;

  return (
    <ModalScreen
      title="Nuevo grupo"
      onClose={() => router.back()}
      footer={
        <AppButton
          title="Crear grupo"
          loading={mutation.isPending}
          disabled={!canSave}
          onPress={() => mutation.mutate()}
        />
      }>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre del grupo"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card },
          ]}
          autoFocus
        />

        <ThemedText type="muted" style={styles.label}>
          Color
        </ThemedText>
        <View style={styles.colors}>
          {GROUP_COLOR_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => {
                void hapticSelection();
                setColor(preset);
              }}
              style={[
                styles.colorDot,
                { backgroundColor: preset },
                color === preset && styles.colorDotActive,
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  label: {
    fontWeight: '600',
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
