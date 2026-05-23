import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppColors } from "@/hooks/use-app-colors";
import { getChartHeightScale } from "@/src/utils/chart-data";

type SimpleBarChartProps = {
  data: { date: string; totalCents: number }[];
  barColor?: string;
  /** Al cambiar, las barras se vuelven a montar. */
  animateKey?: string;
};

const CHART_HEIGHT = 120;
const BAR_WIDTH = 28;
const BAR_GAP = 8;
const COLUMN_HEIGHT = CHART_HEIGHT + 36;

export function SimpleBarChart({
  data,
  barColor,
  animateKey,
}: SimpleBarChartProps) {
  const colors = useAppColors();
  const color = barColor ?? colors.primary;

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText type="muted">Sin movimientos en este período</ThemedText>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.totalCents), 1);
  const heightScale = getChartHeightScale(data);
  const maxBarHeight = CHART_HEIGHT * heightScale;
  const nonZero = data.filter((d) => d.totalCents > 0).length;

  return (
    <View style={styles.wrapper}>
      {nonZero <= 2 ? (
        <ThemedText type="muted" style={styles.hint}>
          Registra más días para ver la tendencia completa
        </ThemedText>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chart}>
          {data.map((point) => {
            const hasValue = point.totalCents > 0;
            const barHeight = hasValue
              ? Math.max(8, (point.totalCents / max) * maxBarHeight)
              : 3;
            const label = point.date.slice(8);

            return (
              <View
                key={`${animateKey ?? ""}-${point.date}`}
                style={styles.barColumn}
              >
                {hasValue ? (
                  <ThemedText style={styles.amount} numberOfLines={1}>
                    {(point.totalCents / 100).toFixed(0)}
                  </ThemedText>
                ) : (
                  <View style={styles.amountSpacer} />
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: hasValue ? color : colors.cardBorder,
                      opacity: hasValue ? 1 : 0.5,
                    },
                  ]}
                />
                <ThemedText type="muted" style={styles.label}>
                  {label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: COLUMN_HEIGHT,
    gap: BAR_GAP,
    paddingHorizontal: 4,
  },
  barColumn: {
    width: BAR_WIDTH,
    height: COLUMN_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  amount: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 4,
    maxWidth: BAR_WIDTH + 12,
  },
  amountSpacer: {
    height: 14,
  },
  bar: {
    width: BAR_WIDTH - 4,
    borderRadius: 6,
    minHeight: 3,
  },
  label: {
    fontSize: 10,
    marginTop: 6,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
});
