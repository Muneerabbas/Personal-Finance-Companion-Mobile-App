import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';

const GAP = 16;

/** Home dashboard placeholder (balance, stats, chart, list). */
export function HomeScreenSkeleton() {
  return (
    <View style={styles.column}>
      <SkeletonBox width="100%" height={112} borderRadius={22} />
      <View style={styles.incomeExpenseCol}>
        <SkeletonBox width="100%" height={76} borderRadius={18} />
        <SkeletonBox width="100%" height={76} borderRadius={18} />
      </View>
      <SkeletonBox width="100%" height={140} borderRadius={22} />
      <SkeletonBox width="100%" height={72} borderRadius={18} />
      <View style={styles.chartCard}>
        <View style={styles.chartHeaderRow}>
          <SkeletonBox width={120} height={14} borderRadius={6} />
          <SkeletonBox width={80} height={14} borderRadius={6} />
        </View>
        <View style={styles.barsRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} width={32} height={Math.max(36, 24 + (i % 4) * 16)} borderRadius={8} />
          ))}
        </View>
        <SkeletonBox width="60%" height={12} borderRadius={6} style={{ alignSelf: 'center' }} />
      </View>
      <View style={styles.listHeader}>
        <SkeletonBox width={140} height={18} borderRadius={8} />
        <SkeletonBox width={56} height={14} borderRadius={6} />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.txRow}>
          <SkeletonBox width={48} height={48} borderRadius={14} />
          <View style={styles.txMeta}>
            <SkeletonBox width="55%" height={16} borderRadius={6} />
            <SkeletonBox width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBox width={64} height={18} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

/** Transactions list placeholder. */
export function TransactionScreenSkeleton() {
  return (
    <View style={styles.column}>
      <SkeletonBox width="100%" height={48} borderRadius={14} />
      <View style={styles.pillsRow}>
        <SkeletonBox width={72} height={36} borderRadius={18} />
        <SkeletonBox width={88} height={36} borderRadius={18} />
        <SkeletonBox width={96} height={36} borderRadius={18} />
      </View>
      {[0, 1].map((section) => (
        <View key={section} style={styles.sectionBlock}>
          <SkeletonBox width={160} height={16} borderRadius={6} style={{ marginBottom: 10 }} />
          <View style={styles.cardBlock}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={styles.txRow}>
                <SkeletonBox width={44} height={44} borderRadius={12} />
                <View style={styles.txMeta}>
                  <SkeletonBox width="50%" height={15} borderRadius={6} />
                  <SkeletonBox width="65%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
                </View>
                <SkeletonBox width={56} height={16} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Insights / budget screen placeholder. */
export function BudgetScreenSkeleton() {
  return (
    <View style={styles.column}>
      <View style={styles.budgetHero}>
        <SkeletonBox width={200} height={22} borderRadius={8} />
        <SkeletonBox width={140} height={16} borderRadius={6} style={{ marginTop: 12 }} />
      </View>
      <View style={styles.bentoLargeSk}>
        <View style={styles.bentoCopy}>
          <SkeletonBox width="70%" height={16} borderRadius={6} />
          <SkeletonBox width="100%" height={12} borderRadius={6} style={{ marginTop: 10 }} />
          <SkeletonBox width="90%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          {(['55%', '60%', '58%', '62%'] as const).map((w, i) => (
            <View key={i} style={styles.legendSk}>
              <SkeletonBox width={12} height={12} borderRadius={6} />
              <SkeletonBox width={w} height={14} borderRadius={6} />
              <SkeletonBox width={36} height={14} borderRadius={6} />
            </View>
          ))}
        </View>
        <SkeletonBox width={180} height={180} borderRadius={90} style={{ alignSelf: 'center' }} />
      </View>
      <SkeletonBox width="100%" height={160} borderRadius={20} />
      <View style={styles.miniBarsSk}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} width={40} height={48 + (i % 3) * 12} borderRadius={8} />
        ))}
      </View>
    </View>
  );
}

/** Goals / challenges screen placeholder. */
export function GoalsScreenSkeleton() {
  return (
    <View style={styles.column}>
      <View style={styles.goalsTitleRow}>
        <View style={{ flex: 1 }}>
          <SkeletonBox width="75%" height={26} borderRadius={8} />
          <SkeletonBox width="90%" height={14} borderRadius={6} style={{ marginTop: 10 }} />
        </View>
        <SkeletonBox width={100} height={44} borderRadius={22} />
      </View>
      <SkeletonBox width="100%" height={52} borderRadius={16} />
      <SkeletonBox width="100%" height={88} borderRadius={20} />
      <SkeletonBox width="100%" height={220} borderRadius={24} />
      <SkeletonBox width="100%" height={100} borderRadius={20} />
      <SkeletonBox width="100%" height={100} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: GAP,
  },
  incomeExpenseCol: {
    gap: 12,
  },
  chartCard: {
    gap: 16,
    paddingVertical: 8,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    minHeight: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionBlock: {
    gap: 0,
  },
  cardBlock: {
    gap: 0,
    paddingVertical: 8,
  },
  budgetHero: {
    marginBottom: 4,
  },
  bentoLargeSk: {
    flexDirection: 'column',
    gap: 20,
    padding: 20,
    borderRadius: 24,
  },
  bentoCopy: {
    gap: 0,
  },
  legendSk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  miniBarsSk: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    minHeight: 72,
  },
  goalsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
});
