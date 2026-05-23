import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, SkeletonRow } from '@/src/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        <SkeletonBlock width={72} height={36} borderRadius={18} />
        <SkeletonBlock width={56} height={36} borderRadius={18} />
        <SkeletonBlock width={64} height={36} borderRadius={18} />
      </View>
      <SkeletonBlock height={88} borderRadius={16} />
      <SkeletonBlock height={140} borderRadius={16} />
      <SkeletonBlock height={120} borderRadius={16} />
      <SkeletonBlock height={160} borderRadius={16} />
    </View>
  );
}

export function TransactionsSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <SkeletonBlock width={44} height={44} borderRadius={12} />
        <SkeletonBlock width="40%" height={20} />
        <SkeletonBlock width={44} height={44} borderRadius={12} />
      </View>
      <SkeletonBlock height={72} borderRadius={14} />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
