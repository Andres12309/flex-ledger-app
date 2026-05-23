import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { appendAmountDigit, backspaceAmount } from '@/src/utils/amount-input';
import { hapticLight, hapticMedium } from '@/src/utils/haptics';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['⌫', '0', ''],
] as const;

type AmountKeypadProps = {
  amountCents: number;
  onChange: (cents: number) => void;
};

export function AmountKeypad({ amountCents, onChange }: AmountKeypadProps) {
  const colors = useAppColors();

  const handleKey = (key: string) => {
    if (key === '⌫') {
      void hapticMedium();
      onChange(backspaceAmount(amountCents));
      return;
    }
    if (key === '') return;
    void hapticLight();
    onChange(appendAmountDigit(amountCents, Number(key)));
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key === '') {
              return <View key={keyIndex} style={styles.keyEmpty} />;
            }
            const isBackspace = key === '⌫';
            return (
              <Pressable
                key={key}
                style={[styles.key, isBackspace && styles.keyMuted]}
                onPress={() => handleKey(key)}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.keyText, !isBackspace && { color: colors.primary }]}>
                  {key}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  key: {
    flex: 1,
    aspectRatio: 1.6,
    maxHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  keyMuted: {
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  keyEmpty: {
    flex: 1,
  },
  keyText: {
    fontSize: 22,
  },
});
