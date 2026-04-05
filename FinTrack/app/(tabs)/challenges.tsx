import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { CurrencyText } from '@/components/currency-text';
import AppHeader from '@/components/layout/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store/useStore';

interface ThemeColors {
  background: string;
  card: string;
  border: string;
  muted: string;
  text: string;
  primary: string;
  innerBg: string;
}

function getColors(colorScheme: 'light' | 'dark', theme: any): ThemeColors {
  const isDark = colorScheme === 'dark';
  return {
    background: isDark ? '#0E1220' : theme.background,
    card: isDark ? '#1C2230' : '#FFFFFF',
    border: isDark ? '#2E3748' : theme.border,
    innerBg: isDark ? '#232938' : '#F3F4F8',
    muted: isDark ? '#8D95B2' : theme.muted,
    text: isDark ? '#F5F5FF' : theme.text,
    primary: theme.primary,
  };
}

// 2. Active Goal Card
function GoalCard({ themeColors, goal }: { themeColors: ThemeColors; goal: any }) {
  if (!goal) return null;
  const progress = goal.target_amount ? goal.saved_amount / goal.target_amount : 0;
  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <View style={styles.goalHeaderRow}>
        <View>
          <ThemedText style={[styles.label, { color: themeColors.primary }]}>ACTIVE GOAL</ThemedText>
          <ThemedText style={[styles.cardTitle, { color: themeColors.text }]}>{goal.title}</ThemedText>
        </View>
        <CurrencyText amountUsd={goal.target_amount} style={[styles.cardTitle, { color: themeColors.text }]} />
      </View>
      <View>
        <View style={[styles.flexBetween, { marginBottom: 12 }]}>
          <ThemedText style={[styles.mutedText, { color: themeColors.muted }]}>Progress</ThemedText>
          <ThemedText style={{ color: themeColors.primary, fontFamily: Fonts.bold }}>
            {Math.round(progress * 100)}%
          </ThemedText>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: themeColors.innerBg }]}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[themeColors.primary, themeColors.primary + '80']}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <View style={[styles.flexBetween, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemedText style={{ color: themeColors.muted, fontSize: 14 }}>Remaining: </ThemedText>
            <CurrencyText
              amountUsd={Math.max(0, goal.target_amount - goal.saved_amount)}
              style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: themeColors.text }}
            />
            <ThemedText style={{ color: themeColors.muted, fontSize: 14 }}> more to go</ThemedText>
          </View>
          <Ionicons name="trending-up" size={18} color={themeColors.primary} />
        </View>
      </View>
    </View>
  );
}

// 3. Monthly Budget Card
function BudgetCard({ themeColors, budget, totalExpenses }: { themeColors: ThemeColors; budget: number; totalExpenses: number }) {
  const utilizedRaw = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const utilized = Math.min(100, Math.round(utilizedRaw));
  const radius = 55;
  const strokeWidth = 8;
  const circum = 2 * Math.PI * radius;
  const strokeDashoffset = circum - (utilized / 100) * circum;

  return (
    <View style={[styles.budgetCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <ThemedText style={[styles.label, { color: themeColors.muted, marginBottom: 24 }]}>
        MONTHLY BUDGET
      </ThemedText>

      <View style={styles.chartContainer}>
        <Svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx="65" cy="65" r={radius} stroke={themeColors.innerBg} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx="65"
            cy="65"
            r={radius}
            stroke={themeColors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circum}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.chartInner}>
          <ThemedText style={[styles.chartPercentage, { color: themeColors.text }]}>{utilized}%</ThemedText>
          <ThemedText style={[styles.chartLabel, { color: themeColors.muted }]}>UTILIZED</ThemedText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        <ThemedText style={{ color: themeColors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
          You're on track to save{' '}
          <CurrencyText amountUsd={Math.max(0, budget - totalExpenses)} style={{ color: themeColors.primary, fontFamily: Fonts.bold, fontSize: 14 }} />{' '}
          this month.
        </ThemedText>
      </View>
    </View>
  );
}

// 4. Upcoming Milestones Section
function MilestoneItem({
  themeColors,
  icon,
  title,
  amountUsd,
  progress,
  isPrimary,
}: {
  themeColors: ThemeColors;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  amountUsd: number;
  progress: number;
  isPrimary: boolean;
}) {
  const accentColor = isPrimary ? themeColors.primary : '#E2925A';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.milestoneItem,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
        pressed && { opacity: 0.8 },
      ]}>
      <View style={[styles.milestoneIconWrap, { backgroundColor: themeColors.innerBg }]}>
        <Ionicons name={icon} size={24} color={accentColor} />
      </View>
      <View style={styles.milestoneContent}>
        <View style={styles.flexBetween}>
          <ThemedText style={[styles.milestoneTitle, { color: themeColors.text }]}>{title}</ThemedText>
          <CurrencyText amountUsd={amountUsd} style={{ color: themeColors.muted, fontSize: 14 }} />
        </View>
        <View style={[styles.milestoneTrack, { backgroundColor: themeColors.innerBg }]}>
          <View style={[styles.milestoneFill, { width: `${progress}%`, backgroundColor: accentColor }]} />
        </View>
      </View>
      <ThemedText style={[styles.milestonePercentage, { color: accentColor }]}>{progress}%</ThemedText>
    </Pressable>
  );
}

// 5. Smart Insight Card
function InsightCard({ themeColors, goal }: { themeColors: ThemeColors, goal: any }) {
  if (!goal) return null;
  return (
    <LinearGradient
      colors={[themeColors.innerBg, themeColors.card]}
      style={[styles.insightCard, { borderColor: themeColors.border }]}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIconWrap, { backgroundColor: themeColors.primary + '20' }]}>
          <Ionicons name="bulb" size={20} color={themeColors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.insightTitle, { color: themeColors.text }]}>Smart Insight</ThemedText>
          <ThemedText style={[styles.insightDesc, { color: themeColors.muted }]}>
            By cutting back on unnecessary expenses by 15% next month, you could reach your{' '}
            <ThemedText style={{ color: themeColors.text, fontFamily: Fonts.semiBold }}>{goal.title}</ThemedText> goal 12
            days earlier.
          </ThemedText>
          <Pressable style={[styles.insightBtn, { backgroundColor: themeColors.primary }]}>
            <ThemedText style={styles.insightBtnText}>Adjust Budget</ThemedText>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

// Main Screen
export default function ChallengesScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const themeColors = getColors(colorScheme, theme);

  const goals = useStore(state => state.goals);
  const fetchGoals = useStore(state => state.fetchGoals);
  const monthlyBudget = useStore(state => state.monthlyBudget);
  const getTotalExpenses = useStore(state => state.getTotalExpenses);

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalExpenses = getTotalExpenses();
  const primaryGoal = goals.find(g => g.is_primary) || goals[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader />

        {/* Title Section */}
        <View style={styles.headerSection}>
          <ThemedText type="title" style={[styles.screenTitle, { color: themeColors.text }]}>
            Financial Goals
          </ThemedText>
          <ThemedText style={[styles.screenSubtitle, { color: themeColors.muted }]}>
            Strategic planning for your future.
          </ThemedText>
        </View>

        {/* Dynamic Grid Layout */}
        <View style={styles.grid}>
          {primaryGoal ? <GoalCard themeColors={themeColors} goal={primaryGoal} /> : null}
          <BudgetCard themeColors={themeColors} budget={monthlyBudget || 2500} totalExpenses={totalExpenses} />
        </View>

        {/* Milestones Section */}
        {goals.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: themeColors.text }]}>Upcoming Milestones</ThemedText>
            <Pressable>
              <ThemedText style={[styles.viewAllBtn, { color: themeColors.primary }]}>View All</ThemedText>
            </Pressable>
          </View>
          <View style={styles.milestonesList}>
            {goals.map((g: any, i: number) => {
              const progress = g.target_amount ? Math.round((g.saved_amount / g.target_amount) * 100) : 0;
              return (
                <MilestoneItem
                  key={g.id || i}
                  themeColors={themeColors}
                  icon={g.icon || "star"}
                  title={g.title}
                  amountUsd={g.target_amount}
                  progress={progress}
                  isPrimary={g.is_primary}
                />
              )
            })}
          </View>
        </View>
        )}

        <InsightCard themeColors={themeColors} goal={primaryGoal} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, gap: 24 },
  headerSection: { marginTop: 8 },
  screenTitle: { fontSize: 28, marginBottom: 4 },
  screenSubtitle: { fontSize: 15 },
  grid: { gap: 16 },
  card: { borderRadius: 24, borderWidth: 1, padding: 24, overflow: 'hidden' },
  flexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalHeaderRow: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 24 },
  mutedText: { fontSize: 14, fontFamily: Fonts.sans },
  progressBarBg: { height: 12, borderRadius: 6, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  budgetCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center' },
  chartContainer: { alignItems: 'center', justifyContent: 'center', width: 130, height: 130 },
  chartInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  chartPercentage: { fontFamily: Fonts.bold, fontSize: 28 },
  chartLabel: { fontFamily: Fonts.semiBold, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  sectionWrap: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 18 },
  viewAllBtn: { fontFamily: Fonts.bold, fontSize: 14 },
  milestonesList: { gap: 12 },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
  milestoneIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  milestoneContent: { flex: 1, marginRight: 16 },
  milestoneTitle: { fontFamily: Fonts.bold, fontSize: 15, marginBottom: 8 },
  milestoneTrack: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  milestoneFill: { height: '100%', borderRadius: 3 },
  milestonePercentage: { fontFamily: Fonts.bold, fontSize: 13 },
  insightCard: { borderRadius: 24, borderWidth: 1, padding: 24 },
  insightHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  insightIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 8 },
  insightDesc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  insightBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  insightBtnText: { color: '#FFFFFF', fontFamily: Fonts.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
});
