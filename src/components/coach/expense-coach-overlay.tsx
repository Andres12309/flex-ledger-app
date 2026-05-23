import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Platform, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useAppColors } from "@/hooks/use-app-colors";
import { useDatabase } from "@/src/providers/database-context";
import {
  getUserSettings,
  markExpenseCoachSeen,
} from "@/src/repositories/user-settings";
import { hapticLight, hapticSuccess } from "@/src/utils/haptics";

const TAB_BAR_BASE = Platform.OS === "ios" ? 49 : 56;

export function ExpenseCoachOverlay() {
  const { db } = useDatabase();
  const queryClient = useQueryClient();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  const settingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => getUserSettings(db),
  });

  const dismissMutation = useMutation({
    mutationFn: () => markExpenseCoachSeen(db),
    onSuccess: async () => {
      await hapticSuccess();
      await queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.06, { duration: 700 }),
            withTiming(1, { duration: 700 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));

  const settings = settingsQuery.data;
  const visible = Boolean(
    settings?.onboardingCompleted && !settings.expenseCoachSeen,
  );

  if (!visible) {
    return null;
  }

  const fabBottom = TAB_BAR_BASE + insets.bottom + 20;

  const handleDismiss = () => {
    void hapticLight();
    dismissMutation.mutate();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(280)}
      style={styles.layer}
      pointerEvents="box-none"
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <Animated.View
        style={[
          styles.card,
          {
            bottom: fabBottom + 72,
            borderColor: colors.primary,
            backgroundColor: colors.card,
          },
          pulseStyle,
        ]}
      >
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Tu primer gasto en segundos
        </ThemedText>
        <ThemedText type="muted" style={styles.body}>
          Toca el botón + abajo para registrar monto y categoría. Sin
          formularios largos.
        </ThemedText>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleDismiss}
        >
          <ThemedText
            style={styles.btnText}
            lightColor={colors.primaryForeground}
            darkColor={colors.primaryForeground}
          >
            ¡Entendido!
          </ThemedText>
        </Pressable>
      </Animated.View>
      <Animated.View
        style={[
          styles.fabGhost,
          {
            bottom: fabBottom,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          pulseStyle,
        ]}
      >
        <ThemedText
          style={styles.fabPlus}
          lightColor={colors.primaryForeground}
          darkColor={colors.primaryForeground}
        >
          +
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  card: {
    position: "absolute",
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 18,
  },
  body: {
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    fontWeight: "700",
    fontSize: 16,
  },
  fabGhost: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  fabPlus: {
    fontSize: 34,
    fontWeight: "200",
    marginTop: -2,
  },
});
