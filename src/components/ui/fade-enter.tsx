import { type ReactNode } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type FadeEnterProps = {
  children: ReactNode;
  /** Cambia al actualizar contenido (ej. mes en movimientos). */
  transitionKey: string;
};

export function FadeEnter({ children, transitionKey }: FadeEnterProps) {
  return (
    <Animated.View
      key={transitionKey}
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(180)}
      style={{ flex: 1 }}>
      {children}
    </Animated.View>
  );
}
