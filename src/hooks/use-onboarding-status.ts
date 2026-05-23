import { useQuery } from '@tanstack/react-query';

import { useDatabase } from '@/src/providers/database-context';
import { getUserSettings } from '@/src/repositories/user-settings';

export function useOnboardingStatus() {
  const { db, isReady } = useDatabase();

  return useQuery({
    queryKey: ['user-settings'],
    queryFn: () => getUserSettings(db),
    enabled: isReady,
  });
}
