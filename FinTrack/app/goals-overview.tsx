import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddToGoalModal from '@/components/goals/AddToGoalModal';
import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import PrimaryButton from '@/components/ui/primary-button';
import { Fonts } from '@/constants/theme';
import { useAppAlert } from '@/context/app-alert-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/store/useStore';

const TERTIARY_ACCENT = '#E2925A';
const COMPLETE_GREEN = '#16A34A';
const COMPLETE_GREEN_DARK = '#4ADE80';

function isGoalComplete(g: { target_amount?: unknown; saved_amount?: unknown }) {
  const target = Number(g.target_amount);
  const saved = Number(g.saved_amount);
  if (!Number.isFinite(target) || target <= 0) return false;
  return Number.isFinite(saved) && saved >= target;
}

function iconForGoal(icon?: string): keyof typeof Ionicons.glyphMap {
  const m: Record<string, keyof typeof Ionicons.glyphMap> = {
    flight: 'airplane',
    airplane: 'airplane',
    emergency: 'medical',
    star: 'star',
  };
  if (icon && m[icon]) return m[icon];
  return 'flag';
}

function UpcomingGoalRow({
  icon,
  title,
  amountUsd,
  progress,
  usePrimaryAccent,
  cardBg,
  border,
  text,
  muted,
  primary,
  trackBg,
  showAddButton,
  onAddToGoal,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  amountUsd: number;
  progress: number;
  usePrimaryAccent: boolean;
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  trackBg: string;
  showAddButton: boolean;
  onAddToGoal?: () => void;
}) {
  const accent = usePrimaryAccent ? primary : TERTIARY_ACCENT;

  return (
    <View style={[styles.goalRow, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.goalIconWrap, { backgroundColor: trackBg }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={styles.goalContent}>
        <View style={styles.goalTopRow}>
          <ThemedText style={[styles.goalTitle, { color: text }]} numberOfLines={1}>
            {title}
          </ThemedText>
          <CurrencyText amountUsd={amountUsd} style={[styles.goalAmount, { color: muted }]} />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: trackBg }]}>
          <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%`, backgroundColor: accent }]} />
        </View>
        <View style={styles.goalBottomRow}>
          <ThemedText style={[styles.progressLabel, { color: muted }]}>{Math.min(100, progress)}% saved</ThemedText>
          {showAddButton && onAddToGoal ? (
            <PrimaryButton
              title="Add funds"
              onPress={onAddToGoal}
              style={[styles.addButton, { backgroundColor: primary, height: 36 }]}
              textStyle={styles.addButtonText}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function CompletedGoalRow({
  title,
  savedUsd,
  targetUsd,
  cardBg,
  border,
  text,
  muted,
  trackBg,
  isDark,
}: {
  title: string;
  savedUsd: number;
  targetUsd: number;
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  trackBg: string;
  isDark: boolean;
}) {
  const success = isDark ? COMPLETE_GREEN_DARK : COMPLETE_GREEN;

  return (
    <View style={[styles.goalRow, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.goalIconWrap, { backgroundColor: `${success}22` }]}>
        <Ionicons name="checkmark-circle" size={24} color={success} />
      </View>
      <View style={styles.goalContent}>
        <View style={styles.goalTopRow}>
          <ThemedText style={[styles.goalTitle, { color: text }]} numberOfLines={1}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.doneBadge, { color: success, backgroundColor: `${success}18` }]}>
            Done
          </ThemedText>
        </View>
        <ThemedText style={[styles.doneMeta, { color: muted }]}>
          Saved{' '}
          <CurrencyText amountUsd={savedUsd} style={{ color: muted, fontFamily: Fonts.semiBold, fontSize: 13 }} />
          {' of '}
          <CurrencyText amountUsd={targetUsd} style={{ color: text, fontFamily: Fonts.semiBold, fontSize: 13 }} />
        </ThemedText>
        <View style={[styles.progressTrack, { backgroundColor: trackBg, marginTop: 10 }]}>
          <View style={[styles.progressFill, { width: '100%', backgroundColor: success }]} />
        </View>
      </View>
    </View>
  );
}

function EmptyCard({
  icon,
  title,
  subtitle,
  accent,
  cardBg,
  border,
  text,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: string;
  cardBg: string;
  border: string;
  text: string;
  muted: string;
}) {
  return (
    <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.emptyIconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={28} color={accent} />
      </View>
      <ThemedText style={[styles.emptyTitle, { color: text }]}>{title}</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: muted }]}>{subtitle}</ThemedText>
    </View>
  );
}

export default function GoalsOverviewScreen() {
  const router = useRouter();
  const { showAlert } = useAppAlert();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const trackBg = isDark ? border : '#EEF1F6';

  const goals = useStore((state) => state.goals);
  const fetchGoals = useStore((state) => state.fetchGoals);
  const refreshAllData = useStore((state) => state.refreshAllData);
  const allocateToGoal = useStore((state) => state.allocateToGoal);

  const [allocateTarget, setAllocateTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const { refreshing, onRefresh } = usePullRefresh(refreshAllData);

  const netBalance = useStore((state) => state.getNetBalance());
  const availableToAllocateUsd = Math.max(0, netBalance);

  const { upcomingGoals, completedGoals } = useMemo(() => {
    const upcoming: typeof goals = [];
    const completed: typeof goals = [];

    for (const g of goals) {
      if (isGoalComplete(g)) completed.push(g);
      else upcoming.push(g);
    }

    return { upcomingGoals: upcoming, completedGoals: completed };
  }, [goals]);

  const handleAllocate = useCallback(
    async (amountUsd: number) => {
      if (!allocateTarget) return;
      try {
        await allocateToGoal(allocateTarget.id, amountUsd);
        showAlert({ title: 'Allocated', message: `Added to ${allocateTarget.title}.` });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        showAlert({ title: 'Could not allocate', message: msg });
      }
    },
    [allocateTarget, allocateToGoal, showAlert],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText style={[styles.headerTitle, { color: text }]}>All goals</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: muted }]}>
            Review your upcoming and completed goals in one place.
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={[styles.content, styles.scrollContentGrow]}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primary}
            colors={[primary]}
            progressBackgroundColor={card}
          />
        }>
        <View style={[styles.summaryCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: muted }]}>Upcoming</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: text }]}>{upcomingGoals.length}</ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: muted }]}>Completed</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: text }]}>{completedGoals.length}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Upcoming goals</ThemedText>
          </View>
          <View style={styles.list}>
            {upcomingGoals.length > 0 ? (
              upcomingGoals.map((goal, index) => {
                const progress = goal.target_amount
                  ? Math.round(((Number(goal.saved_amount) || 0) / Number(goal.target_amount)) * 100)
                  : 0;

                return (
                  <UpcomingGoalRow
                    key={goal.id ?? `upcoming-${index}`}
                    icon={iconForGoal(goal.icon)}
                    title={goal.title}
                    amountUsd={Number(goal.target_amount) || 0}
                    progress={progress}
                    usePrimaryAccent={!!goal.is_primary || index % 2 === 1}
                    cardBg={card}
                    border={border}
                    text={text}
                    muted={muted}
                    primary={primary}
                    trackBg={trackBg}
                    showAddButton={Boolean(goal.id)}
                    onAddToGoal={goal.id ? () => setAllocateTarget({ id: String(goal.id), title: goal.title }) : undefined}
                  />
                );
              })
            ) : (
              <EmptyCard
                icon="flag-outline"
                title="No upcoming goals"
                subtitle="Create or fund a goal to see it here."
                accent={primary}
                cardBg={card}
                border={border}
                text={text}
                muted={muted}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <ThemedText style={[styles.sectionTitle, { color: text }]}>Completed goals</ThemedText>
          </View>
          <View style={styles.list}>
            {completedGoals.length > 0 ? (
              completedGoals.map((goal, index) => (
                <CompletedGoalRow
                  key={goal.id ?? `completed-${index}`}
                  title={goal.title}
                  savedUsd={Number(goal.saved_amount) || 0}
                  targetUsd={Number(goal.target_amount) || 0}
                  cardBg={card}
                  border={border}
                  text={text}
                  muted={muted}
                  trackBg={trackBg}
                  isDark={isDark}
                />
              ))
            ) : (
              <EmptyCard
                icon="checkmark-done-outline"
                title="No completed goals"
                subtitle="Completed goals will appear here once you hit a target."
                accent={isDark ? COMPLETE_GREEN_DARK : COMPLETE_GREEN}
                cardBg={card}
                border={border}
                text={text}
                muted={muted}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <AddToGoalModal
        visible={allocateTarget !== null}
        goalId={allocateTarget?.id ?? ''}
        goalTitle={allocateTarget?.title ?? ''}
        availableBalanceUsd={availableToAllocateUsd}
        onClose={() => setAllocateTarget(null)}
        onAllocate={handleAllocate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  scrollContentGrow: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backButton: {
    paddingTop: 4,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 6,
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  section: {
    gap: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  list: {
    gap: 12,
  },
  goalRow: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  goalIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
    gap: 10,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  goalAmount: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  goalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  addButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  doneBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  doneMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  emptySubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
