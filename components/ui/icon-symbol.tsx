import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * SF Symbol names usados en la app → Material Icons (Android / web).
 * https://icons.expo.fyi
 */
const MAPPING = {
  'house.fill': 'home',
  'chart.bar.fill': 'bar-chart',
  'list.bullet': 'list',
  'gearshape.fill': 'settings',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'plus': 'add',
  'folder.fill': 'folder',
  'tag.fill': 'local-offer',
  'cart.fill': 'shopping-cart',
  'car.fill': 'directions-car',
  'fork.knife': 'restaurant',
  'heart.fill': 'favorite',
  'gamecontroller.fill': 'sports-esports',
  'banknote.fill': 'payments',
  'ellipsis.circle.fill': 'more-horiz',
  'magnifyingglass': 'search',
  'trash.fill': 'delete',
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>['name']>;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const materialName = MAPPING[name];
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
