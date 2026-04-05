import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { CurrencyText } from '@/components/currency-text';
import AppHeader from '@/components/layout/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/store/useStore';

const TERTIARY_ACCENT = '#E2925A';

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
}: {
  goal: { title: string; target_amount: number; saved_amount: number };
  cardBg: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  trackBg: string;
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
}) {
  const accent = usePrimaryAccent ? primary : TERTIARY_ACCENT;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.milestoneRow,
        { backgroundColor: cardBg, borderColor: border },
        pressed && { opacity: 0.92 },
      ]}>
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
      </View>
      <ThemedText style={[styles.milestonePct, { color: accent }]}>{Math.min(100, progress)}%</ThemedText>
    </Pressable>
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
  const monthlyBudget = useStore((state) => state.monthlyBudget);
  const getTotalExpenses = useStore((state) => state.getTotalExpenses);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totalExpenses = getTotalExpenses();
  const primaryGoal = useMemo(() => goals.find((g) => g.is_primary) || goals[0], [goals]);
  const milestoneGoals = useMemo(
    () => goals.filter((g) => (primaryGoal ? g.id !== primaryGoal.id : true)).slice(0, 6),
    [goals, primaryGoal],
  );

  const demoGoal = useMemo(
    () => ({
      title: 'New iPhone',
      target_amount: 80000,
      saved_amount: 32000,
    }),
    [],
  );

  const displayGoal = primaryGoal || demoGoal;
  const insightTitle = displayGoal.title;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader
          rightAccessory={
            <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={text} />
            </Pressable>
          }
        />

        <View style={styles.pageTitleBlock}>
          <ThemedText type="title" style={[styles.pageTitle, { color: text }]}>
            Financial goals
          </ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: muted }]}>
            Strategic planning for your future.
          </ThemedText>
        </View>

        <View style={[styles.bento, isWide && styles.bentoRow]}>
          <View style={[styles.bentoMain, isWide && styles.bentoMainWide]}>
            <ActiveGoalCard
              goal={displayGoal}
              cardBg={card}
              border={border}
              text={text}
              muted={muted}
              primary={primary}
              trackBg={trackBg}
            />
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

        {(milestoneGoals.length > 0 || goals.length > 1) && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <ThemedText style={[styles.sectionTitle, { color: text }]}>Upcoming milestones</ThemedText>
              <Pressable onPress={() => router.push('/(tabs)/transaction')}>
                <ThemedText style={[styles.viewAll, { color: primary }]}>View all</ThemedText>
              </Pressable>
            </View>
            <View style={styles.milestoneList}>
              {(milestoneGoals.length ? milestoneGoals : goals.slice(1)).map((g, i) => {
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
                  />
                );
              })}
            </View>
          </View>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 28 },
  pageTitleBlock: { gap: 6, marginTop: 4 },
  pageTitle: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 14, lineHeight: 20, fontFamily: Fonts.sans },
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
  milestoneTrack: { height: 6, borderRadius: 999, overflow: 'hidden', width: '100%' },
  milestoneFill: { height: '100%', borderRadius: 999 },
  milestonePct: { fontFamily: Fonts.bold, fontSize: 12, minWidth: 36, textAlign: 'right' },
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
