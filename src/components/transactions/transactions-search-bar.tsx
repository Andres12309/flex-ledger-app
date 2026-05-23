import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { hapticSelection } from '@/src/utils/haptics';

type TransactionsSearchBarProps = {
  value: string;
  onChange: (text: string) => void;
  resultCount?: number;
};

export function TransactionsSearchBar({
  value,
  onChange,
  resultCount,
}: TransactionsSearchBarProps) {
  const colors = useAppColors();

  return (
    <View style={styles.wrap}>
      <View style={[styles.field, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Buscar categoría, grupo o nota…"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => {
              void hapticSelection();
              onChange('');
            }}
            hitSlop={8}>
            <ThemedText type="link" style={styles.clear}>
              ✕
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {value.length > 0 && resultCount != null ? (
        <ThemedText type="muted" style={styles.meta}>
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clear: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    paddingLeft: 4,
  },
});
