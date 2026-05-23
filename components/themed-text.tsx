import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import {
  FONT_BOLD,
  FONT_MEDIUM,
  FONT_REGULAR,
  FONT_SEMIBOLD,
} from '@/src/providers/font-provider';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'muted';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const text = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const link = useThemeColor({ light: lightColor, dark: darkColor }, 'link');
  const muted = useThemeColor({ light: lightColor, dark: darkColor }, 'textMuted');

  const color = type === 'link' ? link : type === 'muted' ? muted : text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'muted' ? styles.muted : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT_REGULAR,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONT_SEMIBOLD,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FONT_BOLD,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: FONT_SEMIBOLD,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: FONT_SEMIBOLD,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT_MEDIUM,
  },
});
