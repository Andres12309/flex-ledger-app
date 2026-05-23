import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type ComponentProps } from 'react';

const ICON_MAP: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'building.2.fill': 'apartment',
  'bolt.fill': 'bolt',
  'cart.fill': 'shopping-cart',
  'fuelpump.fill': 'local-gas-station',
  'bus.fill': 'directions-bus',
  'wrench.fill': 'build',
  'cup.and.saucer.fill': 'local-cafe',
  'bag.fill': 'shopping-bag',
  'mug.fill': 'coffee',
  'pills.fill': 'medication',
  'stethoscope': 'medical-services',
  'play.rectangle.fill': 'subscriptions',
  'ticket.fill': 'confirmation-number',
  'leaf.fill': 'eco',
  'creditcard.fill': 'credit-card',
  'doc.text.fill': 'description',
  'tag.fill': 'local-offer',
  'folder.fill': 'folder',
  'car.fill': 'directions-car',
  'fork.knife': 'restaurant',
  'heart.fill': 'favorite',
  'gamecontroller.fill': 'sports-esports',
  'banknote.fill': 'payments',
  'ellipsis.circle.fill': 'more-horiz',
};

type CategoryMaterialIconProps = {
  icon: string;
  size?: number;
  color: string;
};

export function CategoryMaterialIcon({ icon, size = 18, color }: CategoryMaterialIconProps) {
  const name = ICON_MAP[icon] ?? 'local-offer';
  return <MaterialIcons name={name} size={size} color={color} />;
}
