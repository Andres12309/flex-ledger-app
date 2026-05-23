import { format, startOfDay, subDays } from 'date-fns';

export const STREAK_MILESTONES = [3, 7, 14, 30] as const;

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimeOfDay(now: Date): TimeOfDay {
  const hour = now.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

/** Días consecutivos con al menos un gasto (hacia atrás desde hoy o ayer). */
export function computeExpenseStreak(expenseTimestampsMs: number[], now = new Date()): number {
  if (expenseTimestampsMs.length === 0) return 0;

  const dayKeys = new Set(
    expenseTimestampsMs.map((ts) => format(startOfDay(new Date(ts)), 'yyyy-MM-dd')),
  );

  let cursor = startOfDay(now);
  const todayKey = format(cursor, 'yyyy-MM-dd');

  if (!dayKeys.has(todayKey)) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;
  while (dayKeys.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function getStreakCelebrationMessage(streak: number): string | null {
  switch (streak) {
    case 3:
      return '🔥 ¡3 días seguidos! Tu racha empieza fuerte.';
    case 7:
      return '🌟 ¡7 días de racha! Una semana impecable.';
    case 14:
      return '💪 ¡14 días! El hábito ya es tuyo.';
    case 30:
      return '🏆 ¡30 días de racha! Eres constante de verdad.';
    default:
      return null;
  }
}

export function getStreakToastAfterSave(streakBefore: number, streakAfter: number): string | null {
  if (streakAfter <= streakBefore) return null;
  return getStreakCelebrationMessage(streakAfter);
}

export type DashboardWelcome = {
  subtitle: string;
  warmMessage: string;
  emoji: string;
};

export function buildDashboardWelcome(input: {
  displayName?: string | null;
  familyLabel?: string | null;
  streak: number;
  now?: Date;
}): DashboardWelcome {
  const now = input.now ?? new Date();
  const name = input.displayName?.trim();
  const family = input.familyLabel?.trim();
  const tod = getTimeOfDay(now);

  const greeting = (() => {
    const n = name ? `, ${name}` : '';
    switch (tod) {
      case 'morning':
        return `Buenos días${n}`;
      case 'afternoon':
        return `Buenas tardes${n}`;
      case 'evening':
        return `Buenas noches${n}`;
      default:
        return `Hola${n}`;
    }
  })();

  const familyBit = family ? ` · ${family}` : '';

  if (input.streak >= 7) {
    return {
      subtitle: `${greeting}${familyBit}`,
      emoji: '🔥',
      warmMessage: `Llevas ${input.streak} días seguidos registrando. ¡Qué constancia!`,
    };
  }

  if (input.streak >= 3) {
    return {
      subtitle: `${greeting}${familyBit}`,
      emoji: '✨',
      warmMessage: `Racha de ${input.streak} días. Cada gasto cuenta para tu claridad.`,
    };
  }

  if (input.streak === 1) {
    return {
      subtitle: `${greeting}${familyBit}`,
      emoji: '👋',
      warmMessage: 'Gracias por registrar hoy. Mañana suma otro día a tu racha.',
    };
  }

  if (input.streak === 0) {
    return {
      subtitle: `${greeting}${familyBit}`,
      emoji: '💡',
      warmMessage: 'Registra un gasto hoy y empieza tu racha de control.',
    };
  }

  return {
    subtitle: `${greeting}${familyBit}`,
    emoji: '🙂',
    warmMessage: 'Tu resumen está listo. Sigue así.',
  };
}

export type HouseholdPulse = {
  headline: string;
  detail: string;
};

export function buildHouseholdPulse(input: {
  familyLabel?: string | null;
  familySize?: number | null;
  monthSpentCents: number;
  monthlyBudgetCents?: number | null;
  currency: string;
  formatMoney: (cents: number, currency: string) => string;
}): HouseholdPulse | null {
  const size = input.familySize ?? 0;
  const label = input.familyLabel?.trim();
  if (size < 2 && !label) return null;

  const householdName = label ?? 'Tu hogar';
  const perPerson =
    size >= 2 ? Math.round(input.monthSpentCents / size) : input.monthSpentCents;

  let detail = `Este mes: ${input.formatMoney(input.monthSpentCents, input.currency)} en total`;
  if (size >= 2) {
    detail += ` · ~${input.formatMoney(perPerson, input.currency)} por persona`;
  }

  if (input.monthlyBudgetCents && input.monthlyBudgetCents > 0 && size >= 2) {
    const perPersonBudget = Math.round(input.monthlyBudgetCents / size);
    detail += ` · meta ~${input.formatMoney(perPersonBudget, input.currency)}/persona`;
  }

  return {
    headline: householdName,
    detail,
  };
}
