import { EmptyStateHero } from '@/src/components/ui/empty-state-hero';
import { APP_TAGLINE } from '@/src/constants/app';

type EmptyDashboardProps = {
  displayName?: string | null;
};

export function EmptyDashboard({ displayName }: EmptyDashboardProps) {
  const name = displayName?.trim();
  const title = name ? `${name}, tu dashboard te espera` : 'Tu dashboard te espera';

  return (
    <EmptyStateHero
      emoji="✨"
      title={title}
      message={APP_TAGLINE}
      hint="Pulsa el botón + y registra tu primer gasto. ¡Después celebramos contigo!"
    />
  );
}
