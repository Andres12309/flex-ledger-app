import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import {
  ACCENT_THEME_IDS,
  ACCENT_THEMES,
  type AccentThemeId,
} from '@/src/constants/accent-themes';
import { hapticSelection } from '@/src/utils/haptics';

type AccentThemePickerProps = {
  selected: AccentThemeId;
  onSelect: (id: AccentThemeId) => void;
};

function ColorSwatch({
  id,
  selected,
  onSelect,
}: {
  id: AccentThemeId;
  selected: boolean;
  onSelect: (id: AccentThemeId) => void;
}) {
  const theme = ACCENT_THEMES[id];
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.08 : 1, { damping: 14 }) }],
    borderWidth: withSpring(selected ? 3 : 0),
  }));

  return (
    <Pressable
      onPress={() => {
        void hapticSelection();
        onSelect(id);
      }}
      style={styles.swatchWrap}>
      <Animated.View
        style={[
          styles.swatch,
          { backgroundColor: theme.primary, borderColor: '#fff' },
          animStyle,
        ]}>
        <ThemedText style={styles.emoji}>{theme.emoji}</ThemedText>
      </Animated.View>
      <ThemedText type="muted" style={[styles.label, selected && styles.labelActive]}>
        {theme.label}
      </ThemedText>
    </Pressable>
  );
}

export function AccentThemePicker({ selected, onSelect }: AccentThemePickerProps) {
  return (
    <View style={styles.grid}>
      {ACCENT_THEME_IDS.map((id) => (
        <ColorSwatch key={id} id={id} selected={selected === id} onSelect={onSelect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  swatchWrap: {
    alignItems: 'center',
    width: '28%',
    minWidth: 88,
    gap: 6,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  emoji: {
    fontSize: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    opacity: 1,
  },
});
