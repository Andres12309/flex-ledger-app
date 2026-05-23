import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { triggerHaptic } from '@/src/utils/haptics';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  onPressIn,
  ...rest
}: AppButtonProps) {
  const colors = useAppColors();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      style={[
        styles.base,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      onPressIn={(ev) => {
        if (!disabled && !loading) triggerHaptic();
        onPressIn?.(ev);
      }}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryForeground : colors.primary} />
      ) : (
        <ThemedText
          style={styles.label}
          lightColor={isPrimary ? colors.primaryForeground : colors.primary}
          darkColor={isPrimary ? colors.primaryForeground : colors.tint}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.45,
  },
});
