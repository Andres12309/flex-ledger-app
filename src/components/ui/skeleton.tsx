import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAppColors } from '@/hooks/use-app-colors';

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({
  width = '100%',
  height,
  borderRadius = 10,
  style,
}: SkeletonBlockProps) {
  const colors = useAppColors();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 700 }), withTiming(0.35, { duration: 700 })),
      -1,
      false,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.cardBorder,
        },
        animStyle,
        style,
      ]}
    />
  );
}

type SkeletonRowProps = {
  style?: StyleProp<ViewStyle>;
};

export function SkeletonRow({ style }: SkeletonRowProps) {
  return (
    <View style={[styles.row, style]}>
      <SkeletonBlock width={48} height={48} borderRadius={12} />
      <View style={styles.rowBody}>
        <SkeletonBlock height={14} width="70%" />
        <SkeletonBlock height={12} width="45%" style={styles.rowGap} />
      </View>
      <SkeletonBlock width={72} height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowGap: {
    marginTop: 4,
  },
});
