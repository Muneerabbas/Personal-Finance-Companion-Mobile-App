import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import AddToGoalModal from '@/components/goals/AddToGoalModal';
import CreateGoalModal, { type CreateGoalSubmitPayload } from '@/components/goals/CreateGoalModal';
import { CurrencyText } from '@/components/currency-text';
import AppHeader from '@/components/layout/AppHeader';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

function ActiveGoalCard({
  goal,
  cardBg,
  border,
  text,
  muted,
  primary,
  trackBg,
  showAddButton,
  onAddToGoal,
}: {
  goal: { title: string; target_amount: number; saved_amount: number };
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  trackBg: string;
  showAddButton: boolean;
  onAddToGoal?: () => void;
}) {
  const progress = goal.target_amount ? goal.saved_amount / goal.target_amount : 0;
  const pct = Math.min(100, Math.round(progress * 100));
  return (
    <View style={[styles.goalCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.goalGlow} pointerEvents="none">
        <View style={[styles.goalGlowBlob, { backgroundColor: primary }]} />
      </View>
      <View style={styles.goalCardInner}>
        <View style={styles.goalHeaderRow}>
          <View>
            <ThemedText style={[styles.eyebrow, { color: primary }]}>Active goal</ThemedText>
            <ThemedText style={[styles.goalTitle, { color: text }]}>{goal.title}</ThemedText>
          </View>
          <CurrencyText amountUsd={goal.target_amount} style={[styles.goalTitle, { color: text }]} />
        </View>
        <View style={styles.goalProgressBlock}>
          <View style={styles.flexBetween}>
            <ThemedText style={[styles.bodyMuted, { color: muted }]}>Progress</ThemedText>
            <ThemedText style={[styles.progressPct, { color: primary }]}>{pct}%</ThemedText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: trackBg }]}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[primary, `${primary}CC`]}
              style={[styles.progressFill, { width: `${pct}%` }]}
            />
          </View>
          <View style={styles.flexBetween}>
            <View style={styles.remainingRow}>
              <ThemedText style={[styles.bodyMuted, { color: muted }]}>Remaining: </ThemedText>
              <CurrencyText
                amountUsd={Math.max(0, goal.target_amount - goal.saved_amount)}
                style={[styles.remainingStrong, { color: text }]}
              />
              <ThemedText style={[styles.bodyMuted, { color: muted }]}> more to go</ThemedText>
            </View>
            <Ionicons name="trending-up" size={20} color={primary} />
          </View>
        </View>
        {showAddButton && onAddToGoal ? (
          <Pressable
            onPress={onAddToGoal}
            accessibilityRole="button"
            accessibilityLabel="Add money to this goal"
            style={({ pressed }) => [
              styles.addToGoalBtnFilled,
              { backgroundColor: primary, opacity: pressed ? 0.88 : 1 },
            ]}>
            <ThemedText style={styles.addToGoalBtnTextFilled}>Add Funds</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function MonthlyBudgetRing({
  budget,
  totalExpenses,
  cardBg,
  border,
  text,
  muted,
  primary,
  trackBg,
}: {
  budget: number;
  totalExpenses: number;
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  trackBg: string;
}) {
  const utilizedRaw = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const utilized = Math.min(100, Math.round(utilizedRaw));
  const radius = 52;
  const strokeWidth = 9;
  const circum = 2 * Math.PI * radius;
  const strokeDashoffset = circum - (utilized / 100) * circum;

  return (
    <View style={[styles.budgetCard, { backgroundColor: cardBg, borderColor: border }]}>
      <ThemedText style={[styles.budgetEyebrow, { color: muted }]}>Monthly budget</ThemedText>
      <View style={styles.ringWrap}>
        <Svg width={124} height={124} viewBox="0 0 124 124" style={[styles.ringSvg, { transform: [{ rotate: '-90deg' }] }]}>
          <Circle cx="62" cy="62" r={radius} stroke={trackBg} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx="62"
            cy="62"
            r={radius}
            stroke={primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circum}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <ThemedText style={[styles.ringPct, { color: text }]}>{utilized}%</ThemedText>
          <ThemedText style={[styles.ringLabel, { color: muted }]}>utilized</ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.budgetFoot, { color: muted }]}>
        You&apos;re on track to save{' '}
        <CurrencyText
          amountUsd={Math.max(0, budget - totalExpenses)}
          style={{ color: primary, fontFamily: Fonts.bold, fontSize: 14 }}
        />{' '}
        this month.
      </ThemedText>
    </View>
  );
}

function MilestoneRow({
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
    <View style={[styles.milestoneRow, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.milestoneIcon, { backgroundColor: trackBg }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={styles.milestoneMid}>
        <View style={styles.flexBetween}>
          <ThemedText style={[styles.milestoneName, { color: text }]}>{title}</ThemedText>
          <CurrencyText amountUsd={amountUsd} style={{ color: muted, fontSize: 14, fontFamily: Fonts.sans }} />
        </View>
        <View style={[styles.milestoneTrack, { backgroundColor: trackBg }]}>
          <View style={[styles.milestoneFill, { width: `${Math.min(100, progress)}%`, backgroundColor: accent }]} />
        </View>
        {showAddButton && onAddToGoal ? (
          <Pressable
            onPress={onAddToGoal}
            style={({ pressed }) => [
              styles.milestoneAddBtnFilled,
              { backgroundColor: primary, opacity: pressed ? 0.88 : 1 },
            ]}
            hitSlop={6}>
            <ThemedText style={styles.milestoneAddBtnTextFilled}>Add Funds</ThemedText>
          </Pressable>
        ) : null}
      </View>
      <ThemedText style={[styles.milestonePct, { color: accent }]}>{Math.min(100, progress)}%</ThemedText>
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
    <View style={[styles.completedRow, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.completedIconWrap, { backgroundColor: `${success}22` }]}>
        <Ionicons name="checkmark-circle" size={26} color={success} />
      </View>
      <View style={styles.completedMid}>
        <View style={styles.flexBetween}>
          <ThemedText style={[styles.completedName, { color: text }]} numberOfLines={1}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.completedBadge, { color: success, backgroundColor: `${success}18` }]}>
            Done
          </ThemedText>
        </View>
        <ThemedText style={[styles.completedMeta, { color: muted }]}>
          Saved{' '}
          <CurrencyText amountUsd={savedUsd} style={{ color: muted, fontFamily: Fonts.semiBold, fontSize: 13 }} />
          {' of '}
          <CurrencyText amountUsd={targetUsd} style={{ color: text, fontFamily: Fonts.semiBold, fontSize: 13 }} />
        </ThemedText>
        <View style={[styles.milestoneTrack, { backgroundColor: trackBg, marginTop: 8 }]}>
          <View style={[styles.milestoneFill, { width: '100%', backgroundColor: success }]} />
        </View>
      </View>
    </View>
  );
}

function AllGoalsCompletedHero({
  cardBg,
  border,
  text,
  muted,
  isDark,
}: {
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  isDark: boolean;
}) {
  const success = isDark ? COMPLETE_GREEN_DARK : COMPLETE_GREEN;
  return (
    <View style={[styles.goalCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.goalCardInner}>
        <View style={[styles.allDoneIconWrap, { backgroundColor: `${success}18` }]}>
          <Ionicons name="trophy" size={36} color={success} />
        </View>
        <ThemedText style={[styles.allDoneTitle, { color: text }]}>Every goal completed</ThemedText>
        <ThemedText style={[styles.allDoneBody, { color: muted }]}>
          Nice work. Add a new goal when you are ready for your next milestone.
        </ThemedText>
      </View>
    </View>
  );
}

function SmartInsight({
  goalTitle,
  text,
  muted,
  primary,
  cardBg,
  border,
  innerBg,
  onAdjustBudget,
}: {
  goalTitle: string;
  text: string;
  muted: string;
  primary: string;
  cardBg: string;
  border: string;
  innerBg: string;
  onAdjustBudget: () => void;
}) {
  return (
    <LinearGradient
      colors={[innerBg, cardBg]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.insightCard, { borderColor: border }]}>
      <View style={styles.insightRow}>
        <View style={[styles.insightIconWrap, { backgroundColor: `${primary}22` }]}>
          <Ionicons name="bulb" size={22} color={primary} />
        </View>
        <View style={styles.insightCopy}>
          <ThemedText style={[styles.insightTitle, { color: text }]}>Smart insight</ThemedText>
          <ThemedText style={[styles.insightBody, { color: muted }]}>
            {text}{' '}
            <ThemedText style={{ color: text, fontFamily: Fonts.semiBold }}>{goalTitle}</ThemedText> goal 12 days
            earlier.
          </ThemedText>
          <Pressable
            onPress={onAdjustBudget}
            style={({ pressed }) => [styles.insightCta, { backgroundColor: primary, opacity: pressed ? 0.9 : 1 }]}>
            <ThemedText style={[styles.insightCtaText, { color: '#FFFFFF' }]}>Adjust budget</ThemedText>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function GoalsEmptyState({
  cardBg,
  border,
  text,
  muted,
  primary,
  onAddGoal,
}: {
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  onAddGoal: () => void;
}) {
  return (
    <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={[styles.emptyIconWrap, { backgroundColor: `${primary}18` }]}>
        <Ionicons name="flag-outline" size={32} color={primary} />
      </View>
      <ThemedText style={[styles.emptyTitle, { color: text }]}>No goals yet</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: muted }]}>
        Create your first goal to start tracking your savings
      </ThemedText>
      <PrimaryButton title="Add Goal" onPress={onAddGoal} style={styles.emptyPrimaryBtn} />
    </View>
  );
}

export default function ChallengesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const trackBg = isDark ? border : '#EEF1F6';
  const budgetCardBg = isDark ? '#1E2436' : '#F4F6FA';
  const insightInner = isDark ? '#151a28' : '#F8FAFC';

  const goals = useStore((state) => state.goals);
  const fetchGoals = useStore((state) => state.fetchGoals);
  const addGoal = useStore((state) => state.addGoal);
  const monthlyBudget = useStore((state) => state.monthlyBudget);
  const getTotalExpenses = useStore((state) => state.getTotalExpenses);
  const getNetBalance = useStore((state) => state.getNetBalance);
  const allocateToGoal = useStore((state) => state.allocateToGoal);

  const [allocateTarget, setAllocateTarget] = useState<{ id: string; title: string } | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const netBalance = getNetBalance();

  const openAllocate = useCallback((id: string, title: string) => {
    setAllocateTarget({ id, title });
  }, []);

  const handleAllocate = useCallback(
    async (amountUsd: number) => {
      if (!allocateTarget) return;
      try {
        await allocateToGoal(allocateTarget.id, amountUsd);
        Alert.alert('Allocated', `Added to ${allocateTarget.title}.`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        Alert.alert('Could not allocate', msg);
      }
    },
    [allocateTarget, allocateToGoal],
  );

  const handleCreateGoal = useCallback(
    async (payload: CreateGoalSubmitPayload) => {
      await addGoal({
        title: payload.title,
        target_amount: payload.target_amount,
        saved_amount: 0,
        deadline: payload.deadline,
        icon: 'star',
        is_primary: payload.is_primary,
      });
      Alert.alert('Goal created', `${payload.title} is ready to fund.`);
    },
    [addGoal],
  );

  const totalExpenses = getTotalExpenses();

  const { activeGoals, completedGoals } = useMemo(() => {
    const active: typeof goals = [];
    const done: typeof goals = [];
    for (const g of goals) {
      if (isGoalComplete(g)) done.push(g);
      else active.push(g);
    }
    return { activeGoals: active, completedGoals: done };
  }, [goals]);

  const primaryGoal = useMemo(
    () => activeGoals.find((g) => g.is_primary) || activeGoals[0],
    [activeGoals],
  );

  const milestoneGoals = useMemo(
    () => activeGoals.filter((g) => (primaryGoal ? g.id !== primaryGoal.id : true)).slice(0, 6),
    [activeGoals, primaryGoal],
  );

  const hasGoals = goals.length > 0;
  const hasActiveGoals = activeGoals.length > 0;
  const insightTitle = primaryGoal?.title ?? 'savings';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.pageTitleRow}>
          <View style={styles.pageTitleBlock}>
            <ThemedText type="title" style={[styles.pageTitle, { color: text }]}>
              Financial goals
            </ThemedText>
            <ThemedText style={[styles.pageSubtitle, { color: muted }]}>
              Strategic planning for your future.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setCreateModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Add a new goal"
            style={({ pressed }) => [
              styles.addGoalHeaderBtn,
              { borderColor: primary, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Ionicons name="add" size={20} color={primary} />
            <ThemedText style={[styles.addGoalHeaderBtnText, { color: primary }]}>Add Goal</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.availableStrip, { backgroundColor: card, borderColor: border }]}>
          <ThemedText style={[styles.availableStripText, { color: muted }]}>
            Available to allocate:{' '}
            <CurrencyText
              amountUsd={netBalance}
              style={{ color: text, fontFamily: Fonts.bold, fontSize: 15 }}
            />
          </ThemedText>
        </View>

        <View style={[styles.bento, isWide && styles.bentoRow]}>
          <View style={[styles.bentoMain, isWide && styles.bentoMainWide]}>
            {hasGoals && primaryGoal ? (
              <ActiveGoalCard
                goal={{
                  title: primaryGoal.title,
                  target_amount: Number(primaryGoal.target_amount) || 0,
                  saved_amount: Number(primaryGoal.saved_amount) || 0,
                }}
                cardBg={card}
                border={border}
                text={text}
                muted={muted}
                primary={primary}
                trackBg={trackBg}
                showAddButton={Boolean(primaryGoal.id)}
                onAddToGoal={
                  primaryGoal.id
                    ? () => openAllocate(String(primaryGoal.id), primaryGoal.title)
                    : undefined
                }
              />
            ) : hasGoals && !primaryGoal ? (
              <AllGoalsCompletedHero cardBg={card} border={border} text={text} muted={muted} isDark={isDark} />
            ) : (
              <GoalsEmptyState
                cardBg={card}
                border={border}
                text={text}
                muted={muted}
                primary={primary}
                onAddGoal={() => setCreateModalVisible(true)}
              />
            )}
          </View>
          <View style={[styles.bentoSide, isWide && styles.bentoSideWide]}>
            <MonthlyBudgetRing
              budget={monthlyBudget || 2500}
              totalExpenses={totalExpenses}
              cardBg={budgetCardBg}
              border={border}
              text={text}
              muted={muted}
              primary={primary}
              trackBg={trackBg}
            />
          </View>
        </View>

        {milestoneGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <ThemedText style={[styles.sectionTitle, { color: text }]}>Upcoming milestones</ThemedText>
              <Pressable onPress={() => router.push('/(tabs)/transaction')}>
                <ThemedText style={[styles.viewAll, { color: primary }]}>View all</ThemedText>
              </Pressable>
            </View>
            <View style={styles.milestoneList}>
              {milestoneGoals.map((g, i) => {
                const p = g.target_amount ? Math.round((g.saved_amount / g.target_amount) * 100) : 0;
                return (
                  <MilestoneRow
                    key={g.id ?? i}
                    icon={iconForGoal(g.icon)}
                    title={g.title}
                    amountUsd={g.target_amount}
                    progress={p}
                    usePrimaryAccent={!!g.is_primary || i % 2 === 1}
                    cardBg={card}
                    border={border}
                    text={text}
                    muted={muted}
                    primary={primary}
                    trackBg={trackBg}
                    showAddButton={Boolean(g.id)}
                    onAddToGoal={g.id ? () => openAllocate(String(g.id), g.title) : undefined}
                  />
                );
              })}
            </View>
          </View>
        )}

        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <ThemedText style={[styles.sectionTitle, { color: text }]}>Completed goals</ThemedText>
            </View>
            <View style={styles.milestoneList}>
              {completedGoals.map((g, i) => (
                <CompletedGoalRow
                  key={g.id ?? `done-${i}`}
                  title={g.title}
                  savedUsd={Number(g.saved_amount) || 0}
                  targetUsd={Number(g.target_amount) || 0}
                  cardBg={card}
                  border={border}
                  text={text}
                  muted={muted}
                  trackBg={trackBg}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        )}

        {hasActiveGoals ? (
          <SmartInsight
            goalTitle={insightTitle}
            text='By cutting back on "Dining out" by 15% next month, you could reach your'
            muted={muted}
            primary={primary}
            cardBg={card}
            border={border}
            innerBg={insightInner}
            onAdjustBudget={() => router.push('/(tabs)/budget')}
          />
        ) : null}
      </ScrollView>

      <CreateGoalModal
        visible={createModalVisible}
        isFirstGoal={activeGoals.length === 0}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateGoal}
      />

      <AddToGoalModal
        visible={allocateTarget !== null}
        goalId={allocateTarget?.id ?? ''}
        goalTitle={allocateTarget?.title ?? ''}
        availableBalanceUsd={netBalance}
        onClose={() => setAllocateTarget(null)}
        onAllocate={handleAllocate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 28 },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  pageTitleBlock: { flex: 1, minWidth: 0, gap: 6 },
  pageTitle: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 14, lineHeight: 20, fontFamily: Fonts.sans },
  addGoalHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    marginTop: 2,
  },
  addGoalHeaderBtnText: { fontFamily: Fonts.bold, fontSize: 14 },
  availableStrip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  availableStripText: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20 },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 20, textAlign: 'center' },
  emptySubtitle: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 8 },
  emptyPrimaryBtn: { alignSelf: 'stretch', width: '100%' },
  bento: { gap: 16 },
  bentoRow: { flexDirection: 'row', alignItems: 'stretch', gap: 16 },
  bentoMain: { flex: 1 },
  bentoMainWide: { flex: 1.6, minWidth: 0 },
  bentoSide: { flex: 1 },
  bentoSideWide: { flex: 1, minWidth: 0, maxWidth: 320 },
  goalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    overflow: 'hidden',
  },
  goalGlow: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  goalGlowBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.12,
    right: -72,
    top: -72,
  },
  goalCardInner: { position: 'relative', zIndex: 1 },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  eyebrow: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  goalTitle: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28 },
  goalProgressBlock: { gap: 12 },
  flexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bodyMuted: { fontFamily: Fonts.sans, fontSize: 14 },
  progressPct: { fontFamily: Fonts.bold, fontSize: 18 },
  progressTrack: { height: 12, borderRadius: 999, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 999 },
  remainingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flex: 1, marginRight: 8 },
  remainingStrong: { fontFamily: Fonts.semiBold, fontSize: 14 },
  addToGoalBtnFilled: {
    marginTop: 16,
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToGoalBtnTextFilled: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  budgetCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  budgetEyebrow: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  ringWrap: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ringSvg: { position: 'absolute' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.5 },
  ringLabel: { fontFamily: Fonts.semiBold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 },
  budgetFoot: { fontSize: 14, lineHeight: 22, textAlign: 'center', fontFamily: Fonts.sans },
  section: { gap: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 18 },
  viewAll: { fontFamily: Fonts.bold, fontSize: 14 },
  milestoneList: { gap: 14 },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneMid: { flex: 1, minWidth: 0 },
  milestoneName: { fontFamily: Fonts.bold, fontSize: 15, marginBottom: 8 },
  milestoneAddBtnFilled: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  milestoneAddBtnTextFilled: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  milestoneTrack: { height: 6, borderRadius: 999, overflow: 'hidden', width: '100%' },
  milestoneFill: { height: '100%', borderRadius: 999 },
  milestonePct: { fontFamily: Fonts.bold, fontSize: 12, minWidth: 36, textAlign: 'right' },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  completedIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedMid: { flex: 1, minWidth: 0 },
  completedName: { fontFamily: Fonts.bold, fontSize: 15, flex: 1, marginRight: 8 },
  completedBadge: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  completedMeta: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, marginTop: 6 },
  allDoneIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  allDoneTitle: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28, textAlign: 'center' },
  allDoneBody: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  insightCard: { borderRadius: 24, borderWidth: 1, padding: 22 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  insightIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: { flex: 1, minWidth: 0 },
  insightTitle: { fontFamily: Fonts.bold, fontSize: 17, marginBottom: 8 },
  insightBody: { fontSize: 14, lineHeight: 22, fontFamily: Fonts.sans, marginBottom: 14 },
  insightCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 999,
  },
  insightCtaText: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
});
