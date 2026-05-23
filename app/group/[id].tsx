import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { ModalScreen } from '@/components/ui/modal-screen';
import { SafeCenter } from '@/components/ui/safe-center';
import { useAppColors } from '@/hooks/use-app-colors';
import { GROUP_COLOR_PRESETS } from '@/src/constants/group-colors';
import { useDatabase } from '@/src/providers/database-context';
import {
  createCategory,
  getGroupById,
  softDeleteCategory,
  softDeleteGroup,
  updateCategory,
  updateGroup,
} from '@/src/repositories/groups';
import {
  hapticError,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
  triggerHaptic,
} from '@/src/utils/haptics';

export default function EditGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = id ?? '';
  const router = useRouter();
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupById(db, groupId),
    enabled: groupId.length > 0,
  });

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(GROUP_COLOR_PRESETS[0]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  useEffect(() => {
    if (groupQuery.data) {
      setName(groupQuery.data.name);
      setColor(groupQuery.data.color);
    }
  }, [groupQuery.data]);

  const saveGroupMutation = useMutation({
    mutationFn: () => updateGroup(db, groupId, { name, color }),
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: () => createCategory(db, { groupId, name: newCategoryName }),
    onSuccess: async () => {
      await hapticSuccess();
      setNewCategoryName('');
      await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => softDeleteGroup(db, groupId),
    onSuccess: async () => {
      await hapticWarning();
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.back();
    },
    onError: async (err: Error) => {
      await hapticError();
      Alert.alert('No se pudo eliminar', err.message);
    },
  });

  if (groupQuery.isLoading) {
    return (
      <SafeCenter>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeCenter>
    );
  }

  if (!groupQuery.data) {
    return (
      <SafeCenter>
        <ThemedText>Grupo no encontrado</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Volver</ThemedText>
        </Pressable>
      </SafeCenter>
    );
  }

  const group = groupQuery.data;

  const saveCategoryName = async () => {
    if (!editingCategoryId || editingCategoryName.trim().length < 2) return;
    await updateCategory(db, editingCategoryId, { name: editingCategoryName });
    await hapticSuccess();
    setEditingCategoryId(null);
    await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    await queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    void hapticWarning();
    Alert.alert('Eliminar categoría', `¿Eliminar "${categoryName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await softDeleteCategory(db, categoryId);
            await hapticSuccess();
            await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            await queryClient.invalidateQueries({ queryKey: ['groups'] });
          } catch (err) {
            await hapticError();
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  return (
    <ModalScreen
      title="Editar grupo"
      onClose={() => router.back()}
      footer={
        <AppButton
          title="Guardar grupo"
          loading={saveGroupMutation.isPending}
          disabled={name.trim().length < 2}
          onPress={() => saveGroupMutation.mutate()}
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
        />

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

        <ThemedText type="defaultSemiBold" style={styles.section}>
          Categorías
        </ThemedText>

        {group.categories.map((cat) => (
          <ThemedView
            key={cat.id}
            variant="card"
            style={[styles.catRow, { borderColor: colors.cardBorder }]}>
            {editingCategoryId === cat.id ? (
              <View style={styles.editRow}>
                <TextInput
                  value={editingCategoryName}
                  onChangeText={setEditingCategoryName}
                  style={[
                    styles.input,
                    styles.editInput,
                    { color: colors.text, borderColor: colors.cardBorder },
                  ]}
                  autoFocus
                />
                <Pressable onPress={() => void saveCategoryName()}>
                  <ThemedText type="link">OK</ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  style={styles.catBody}
                  onPress={() => {
                    triggerHaptic();
                    setEditingCategoryId(cat.id);
                    setEditingCategoryName(cat.name);
                  }}>
                  <ThemedText type="defaultSemiBold">{cat.name}</ThemedText>
                  <ThemedText type="muted" style={styles.catHint}>
                    Toca para renombrar
                  </ThemedText>
                </Pressable>
                <Pressable onPress={() => handleDeleteCategory(cat.id, cat.name)}>
                  <ThemedText style={styles.deleteText}>Eliminar</ThemedText>
                </Pressable>
              </>
            )}
          </ThemedView>
        ))}

        <View style={styles.addRow}>
          <TextInput
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Nueva categoría"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.addInput,
              { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.card },
            ]}
          />
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            disabled={newCategoryName.trim().length < 2 || addCategoryMutation.isPending}
            onPress={() => addCategoryMutation.mutate()}>
            <ThemedText
              style={styles.addBtnText}
              lightColor={colors.primaryForeground}
              darkColor={colors.primaryForeground}>
              +
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          style={styles.danger}
          onPress={() => {
            void hapticWarning();
            Alert.alert('Eliminar grupo', `¿Eliminar "${group.name}" y sus categorías?`, [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => deleteGroupMutation.mutate(),
              },
            ]);
          }}>
          <ThemedText style={styles.dangerText}>Eliminar grupo</ThemedText>
        </Pressable>
      </ScrollView>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotActive: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    marginTop: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  catBody: {
    flex: 1,
  },
  catHint: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 24,
    fontWeight: '600',
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  danger: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dangerText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
