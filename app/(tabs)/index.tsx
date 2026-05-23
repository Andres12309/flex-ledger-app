import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScreenShell } from "@/components/ui/screen-shell";
import { TabLoadingShell } from "@/components/ui/tab-loading-shell";
import { useAppColors } from "@/hooks/use-app-colors";
import { AnimatedAmount } from "@/src/components/dashboard/animated-amount";
import { BudgetProgressCard } from "@/src/components/dashboard/budget-progress-card";
import { DashboardInsightBanner } from "@/src/components/dashboard/dashboard-insight-banner";
import { DashboardSkeleton } from "@/src/components/dashboard/dashboard-skeleton";
import { EmptyDashboard } from "@/src/components/dashboard/empty-dashboard";
import { HouseholdPulseCard } from "@/src/components/dashboard/household-pulse-card";
import { PeriodSelector } from "@/src/components/dashboard/period-selector";
import { SimpleBarChart } from "@/src/components/dashboard/simple-bar-chart";
import { TopCategoriesChart } from "@/src/components/dashboard/top-categories-chart";
import { WarmWelcomeBanner } from "@/src/components/dashboard/warm-welcome-banner";
import { SkeletonBlock } from "@/src/components/ui/skeleton";
import {
    ACCENT_THEMES,
    type AccentThemeId,
} from "@/src/constants/accent-themes";
import { APP_NAME } from "@/src/constants/app";
import { ALL_DASHBOARD_PERIODS } from "@/src/domain/dashboard-periods";
import {
    buildDashboardWelcome,
    buildHouseholdPulse,
} from "@/src/domain/engagement";
import {
    buildPeriodInsight,
    getPreviousPeriodRange,
} from "@/src/domain/period-comparison";
import {
    useDashboardSnapshot,
    usePeriodTotals,
} from "@/src/hooks/use-dashboard";
import { useAccentTheme } from "@/src/providers/accent-theme-provider";
import { useDatabase } from "@/src/providers/database-context";
import {
    getCategoryTotalsForPeriod,
    getExpenseStreak,
    getPeriodTotals,
    getTotalCentsForRange,
} from "@/src/repositories/expenses";
import { getUserSettings } from "@/src/repositories/user-settings";
import type { DashboardPeriodId } from "@/src/types";
import { buildChartSeries } from "@/src/utils/chart-data";
import { formatMoney } from "@/src/utils/currency";

export default function DashboardScreen() {
  const colors = useAppColors();
  const { accentId } = useAccentTheme();
  const { db } = useDatabase();
  const snapshot = useDashboardSnapshot();
  const [selectedPeriodId, setSelectedPeriodId] =
    useState<DashboardPeriodId | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => getUserSettings(db),
  });

  const monthTotalsQuery = useQuery({
    queryKey: ["dashboard", "month-totals"],
    queryFn: () => getPeriodTotals(db, "month"),
  });

  const streakQuery = useQuery({
    queryKey: ["engagement", "streak"],
    queryFn: () => getExpenseStreak(db),
  });

  const categoriesQuery = useQuery({
    queryKey: ["dashboard", "categories", selectedPeriodId],
    queryFn: () =>
      selectedPeriodId
        ? getCategoryTotalsForPeriod(db, selectedPeriodId)
        : Promise.resolve([]),
    enabled: selectedPeriodId != null,
  });

  const previousRange = selectedPeriodId
    ? getPreviousPeriodRange(selectedPeriodId)
    : null;

  const previousTotalQuery = useQuery({
    queryKey: ["dashboard", "previous-total", selectedPeriodId],
    queryFn: () =>
      previousRange
        ? getTotalCentsForRange(db, previousRange)
        : Promise.resolve(0),
    enabled: previousRange != null && selectedPeriodId != null,
  });

  useEffect(() => {
    if (snapshot.data?.defaultPeriodId && selectedPeriodId == null) {
      setSelectedPeriodId(snapshot.data.defaultPeriodId);
    }
  }, [snapshot.data?.defaultPeriodId, selectedPeriodId]);

  const totals = usePeriodTotals(selectedPeriodId);

  const chartData = useMemo(() => {
    if (!selectedPeriodId || !totals.data?.byDay) return [];
    return buildChartSeries(selectedPeriodId, totals.data.byDay);
  }, [selectedPeriodId, totals.data?.byDay]);

  const currency = settingsQuery.data?.currency ?? "USD";
  const monthlyBudgetCents = settingsQuery.data?.monthlyBudgetCents ?? null;
  const displayName = settingsQuery.data?.displayName?.trim();
  const familyLabel = settingsQuery.data?.familyLabel?.trim();
  const familySize = settingsQuery.data?.familySize ?? null;
  const streak = streakQuery.data ?? 0;

  const insight = useMemo(() => {
    if (!selectedPeriodId || totals.data == null) return null;
    const periodMeta = ALL_DASHBOARD_PERIODS.find(
      (p) => p.id === selectedPeriodId,
    );
    if (!periodMeta) return null;
    return buildPeriodInsight(
      totals.data.totalCents,
      previousTotalQuery.data ?? 0,
      periodMeta.shortLabel.toLowerCase(),
      (cents) => formatMoney(cents, currency),
    );
  }, [selectedPeriodId, totals.data, previousTotalQuery.data, currency]);

  const welcome = useMemo(
    () =>
      buildDashboardWelcome({
        displayName,
        familyLabel,
        streak,
      }),
    [displayName, familyLabel, streak],
  );

  const householdPulse = useMemo(() => {
    if (!monthTotalsQuery.data) return null;
    return buildHouseholdPulse({
      familyLabel,
      familySize,
      monthSpentCents: monthTotalsQuery.data.totalCents,
      monthlyBudgetCents,
      currency,
      formatMoney,
    });
  }, [
    familyLabel,
    familySize,
    monthTotalsQuery.data,
    monthlyBudgetCents,
    currency,
  ]);

  const showBudget =
    monthlyBudgetCents != null &&
    monthlyBudgetCents > 0 &&
    monthTotalsQuery.data != null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      snapshot.refetch(),
      totals.refetch(),
      categoriesQuery.refetch(),
      previousTotalQuery.refetch(),
      settingsQuery.refetch(),
      monthTotalsQuery.refetch(),
      streakQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [
    snapshot,
    totals,
    categoriesQuery,
    previousTotalQuery,
    settingsQuery,
    monthTotalsQuery,
    streakQuery,
  ]);

  const glow =
    ACCENT_THEMES[accentId as AccentThemeId]?.glow ?? "rgba(13,148,136,0.2)";

  if (snapshot.isLoading) {
    return (
      <TabLoadingShell>
        <DashboardSkeleton />
      </TabLoadingShell>
    );
  }

  const hasExpenses = snapshot.data?.hasAnyExpenses ?? false;
  const visiblePeriods = snapshot.data?.visiblePeriods ?? [];

  return (
    <ScreenShell
      title={APP_NAME}
      subtitle={welcome.subtitle}
      bottomInset={96}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ),
      }}
    >
      {!hasExpenses ? (
        <EmptyDashboard displayName={displayName} />
      ) : (
        <>
          <WarmWelcomeBanner welcome={welcome} streak={streak} />

          {householdPulse ? (
            <HouseholdPulseCard pulse={householdPulse} />
          ) : null}

          {showBudget ? (
            <BudgetProgressCard
              spentCents={monthTotalsQuery.data!.totalCents}
              budgetCents={monthlyBudgetCents!}
              currency={currency}
            />
          ) : null}

          {visiblePeriods.length > 0 && selectedPeriodId ? (
            <>
              <PeriodSelector
                periods={visiblePeriods}
                selectedId={selectedPeriodId}
                onSelect={setSelectedPeriodId}
              />

              {insight ? (
                <DashboardInsightBanner
                  message={insight.headline}
                  detail={insight.detail}
                />
              ) : null}

              {totals.isLoading ? (
                <SkeletonBlock height={120} borderRadius={18} />
              ) : (
                <ThemedView
                  variant="card"
                  style={[
                    styles.heroCard,
                    { borderColor: colors.primary, overflow: "hidden" },
                  ]}
                >
                  <LinearGradient
                    colors={[glow, colors.card]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                  >
                    <ThemedText type="muted">Total del período</ThemedText>
                    <AnimatedAmount
                      key={selectedPeriodId}
                      cents={totals.data?.totalCents ?? 0}
                      currency={currency}
                    />
                    <ThemedText type="muted">
                      {totals.data?.transactionCount ?? 0} movimientos
                      registrados
                    </ThemedText>
                  </LinearGradient>
                </ThemedView>
              )}

              <ThemedView
                variant="card"
                style={[styles.chartCard, { borderColor: colors.cardBorder }]}
              >
                <ThemedText type="subtitle" style={styles.chartTitle}>
                  Evolución
                </ThemedText>
                {totals.isLoading ? (
                  <SkeletonBlock height={140} borderRadius={12} />
                ) : (
                  <SimpleBarChart
                    data={chartData}
                    barColor={colors.primary}
                    animateKey={selectedPeriodId}
                  />
                )}
              </ThemedView>

              <ThemedView
                variant="card"
                style={[styles.chartCard, { borderColor: colors.cardBorder }]}
              >
                <ThemedText type="subtitle" style={styles.chartTitle}>
                  Top categorías
                </ThemedText>
                {categoriesQuery.isLoading ? (
                  <SkeletonBlock height={100} borderRadius={12} />
                ) : (
                  <TopCategoriesChart items={categoriesQuery.data ?? []} />
                )}
              </ThemedView>
            </>
          ) : (
            <ThemedText type="muted" style={styles.waiting}>
              Sigue registrando gastos para desbloquear más períodos (mes,
              trimestre, año).
            </ThemedText>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 0,
  },
  heroGradient: {
    padding: 20,
    gap: 6,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartTitle: {
    marginBottom: 8,
  },
  waiting: {
    lineHeight: 22,
  },
});
