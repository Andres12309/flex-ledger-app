import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { hapticSuccess } from '@/src/utils/haptics';

type ToastVariant = 'success' | 'info' | 'celebrate';

type ToastState = {
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
} | null;

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
  showUndo: (message: string, onUndo: () => void) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = {
  success: 2400,
  celebrate: 3200,
  undo: 5500,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const [toast, setToast] = useState<ToastState>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearHideTimer();
    setToast(null);
  }, [clearHideTimer]);

  const scheduleHide = useCallback(
    (ms: number) => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => setToast(null), ms);
    },
    [clearHideTimer],
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      if (variant === 'success' || variant === 'celebrate') {
        void hapticSuccess();
      }
      setToast({ message, variant });
      scheduleHide(variant === 'celebrate' ? DURATION.celebrate : DURATION.success);
    },
    [scheduleHide],
  );

  const showUndo = useCallback(
    (message: string, onUndo: () => void) => {
      setToast({
        message,
        variant: 'info',
        actionLabel: 'Deshacer',
        onAction: onUndo,
      });
      scheduleHide(DURATION.undo);
    },
    [scheduleHide],
  );

  const value = useMemo(() => ({ show, showUndo }), [show, showUndo]);

  const bg =
    toast?.variant === 'celebrate' || toast?.variant === 'success'
      ? colors.primary
      : colors.card;

  const textOnBg =
    toast?.variant === 'celebrate' || toast?.variant === 'success'
      ? colors.primaryForeground
      : colors.text;

  const handleAction = () => {
    toast?.onAction?.();
    hide();
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          entering={FadeInUp.springify().damping(18)}
          exiting={FadeOutUp.duration(200)}
          style={[styles.host, { top: insets.top + 8 }]}
          pointerEvents="box-none">
          <View
            style={[
              styles.toast,
              {
                backgroundColor: bg,
                borderColor: colors.cardBorder,
              },
            ]}>
            <ThemedText
              style={[styles.toastText, toast.actionLabel ? styles.toastTextCompact : null]}
              lightColor={textOnBg}
              darkColor={textOnBg}>
              {toast.message}
            </ThemedText>
            {toast.actionLabel ? (
              <Pressable onPress={handleAction} hitSlop={8} style={styles.action}>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.actionText}
                  lightColor={colors.primary}
                  darkColor={colors.primary}>
                  {toast.actionLabel}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast dentro de ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
  },
  toastTextCompact: {
    flex: 1,
  },
  action: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionText: {
    fontSize: 15,
  },
});
