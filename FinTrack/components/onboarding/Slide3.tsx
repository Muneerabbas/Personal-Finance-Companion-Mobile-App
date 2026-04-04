import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { getOnboardingColors } from '@/constants/onboarding-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export function Slide3() {
  const scheme = useColorScheme() ?? 'light';
  const c = getOnboardingColors(scheme);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.illustrationContainer}>
        <ThemedText style={[styles.monthlySpendLabel, { color: c.muted }]}>MONTHLY SPEND</ThemedText>
        <ThemedText style={[styles.spendAmount, { color: c.text }]}>$4,250</ThemedText>

        <View style={styles.chartContainer}>
          <View style={[styles.bar, { height: 30, backgroundColor: c.primaryTint }]} />
          <View style={[styles.bar, { height: 50, backgroundColor: c.primaryTint }]} />
          <View style={[styles.bar, { height: 40, backgroundColor: c.primaryTint }]} />
          <View style={[styles.activeBar, { height: 80, backgroundColor: c.primary }]} />
          <View style={[styles.bar, { height: 60, backgroundColor: c.primaryTint }]} />
          <View style={[styles.bar, { height: 30, backgroundColor: c.primaryTint }]} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: c.text }]}>Know where your money goes.</ThemedText>
        <ThemedText style={[styles.subtitle, { color: c.muted }]}>
          Track your transaction easily, with categories and financial report.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustrationContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthlySpendLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  spendAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    marginBottom: 32,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  activeBar: {
    width: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 0,
  },
});
