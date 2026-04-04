import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { getOnboardingColors } from '@/constants/onboarding-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export function Slide1() {
  const scheme = useColorScheme() ?? 'light';
  const c = getOnboardingColors(scheme);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.illustrationContainer}>
        <View style={[styles.circle, { backgroundColor: c.primaryTint }]}>
          <View style={styles.barsContainer}>
            <View style={[styles.bar, { height: 24, backgroundColor: c.primaryTintMedium }]} />
            <View style={[styles.bar, { height: 40, backgroundColor: c.primaryTintMedium }]} />
            <View style={[styles.bar, { height: 60, backgroundColor: c.primary }]} />
          </View>
          <View style={[styles.point, { backgroundColor: c.primary, borderColor: c.badgeSurface }]} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: c.text }]}>
          Gain total <ThemedText style={[styles.highlight, { color: c.primary }]}>control</ThemedText> {'\n'}of your
          money.
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: c.muted }]}>
          Become your own money manager and make every cent count with our editorial financial tools.
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
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 40,
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  point: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
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
  highlight: {
    fontStyle: 'italic',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 0,
  },
});
