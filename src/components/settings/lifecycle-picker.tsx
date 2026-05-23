import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/hooks/use-app-colors';
import { LIFECYCLE_OPTIONS } from '@/src/domain/lifecycle';
import type { LifecycleType } from '@/src/types';
import { hapticSelection } from '@/src/utils/haptics';

type LifecyclePickerProps = {
  selected: LifecycleType;
  onSelect: (value: LifecycleType) => void;
};

export function LifecyclePicker({ selected, onSelect }: LifecyclePickerProps) {
  const colors = useAppColors();

  return (
    <View style={styles.list}>
      {LIFECYCLE_OPTIONS.map((option) => {
        const active = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              void hapticSelection();
              onSelect(option.id);
            }}>
            <ThemedView
              variant="card"
              style={[
                styles.card,
                { borderColor: colors.cardBorder },
                active && { borderColor: colors.primary, borderWidth: 2 },
              ]}>
              <ThemedText type="defaultSemiBold">{option.title}</ThemedText>
              <ThemedText type="muted">{option.description}</ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
});
