import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useAppColors } from '@/hooks/use-app-colors';

type OnboardingProgressProps = {
  step: number;
  total: number;
};

export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  const colors = useAppColors();
  const progress = useSharedValue((step + 1) / total);

  useEffect(() => {
    progress.value = withSpring((step + 1) / total, { damping: 18, stiffness: 120 });
  }, [step, total, progress]);

  const barStyle = useAnimatedStyle(() => ({
    flex: progress.value,
  }));

  const restStyle = useAnimatedStyle(() => ({
    flex: 1 - progress.value,
  }));

  return (
    <View style={styles.track}>
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.primary }, barStyle]}
      />
      <Animated.View style={restStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.2)',
    overflow: 'hidden',
    marginBottom: 20,
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
