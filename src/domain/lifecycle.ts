import type { LifecycleType } from '@/src/types';

export const LIFECYCLE_OPTIONS: {
  id: LifecycleType;
  title: string;
  description: string;
}[] = [
  {
    id: 'per_expense',
    title: 'Al momento',
    description: 'Registro cada gasto cuando ocurre.',
  },
  {
    id: 'daily',
    title: 'Fin del día',
    description: 'Un recordatorio si no registraste nada hoy.',
  },
  {
    id: 'weekly',
    title: 'Resumen semanal',
    description: 'Revisión cada domingo con totales.',
  },
  {
    id: 'paycheck_biweekly',
    title: 'Cada quincena',
    description: 'Alineado a tu ciclo de pago.',
  },
  {
    id: 'monthly_review',
    title: 'Cierre mensual',
    description: 'Resumen al terminar el mes.',
  },
];
