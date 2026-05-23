import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { formatMoney } from '@/src/utils/currency';

type AnimatedAmountProps = {
  cents: number;
  currency?: string;
  style?: object;
};

export function AnimatedAmount({ cents, currency = 'USD', style }: AnimatedAmountProps) {
  const progress = useSharedValue(0);
  const display = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(1, { damping: 16, stiffness: 90 });
    display.value = cents;
  }, [cents, progress, display]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  return (
    <Animated.View style={animStyle}>
      <ThemedText type="title" style={[styles.amount, style]}>
        {formatMoney(cents, currency)}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 36,
    lineHeight: 40,
  },
});
