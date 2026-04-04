import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { getOnboardingColors } from '@/constants/onboarding-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export function Slide2() {
  const scheme = useColorScheme() ?? 'light';
  const c = getOnboardingColors(scheme);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.illustrationContainer}>
        <View
          style={[
            styles.document,
            {
              backgroundColor: c.card,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.border,
              shadowColor: c.shadow,
              shadowOpacity: c.shadowOpacity,
            },
          ]}>
          <View style={styles.docHeader}>
            <View style={[styles.iconCircle, { backgroundColor: c.docAccentIcon }]}>
              <Ionicons name="wallet-outline" size={14} color="#fff" />
            </View>
            <ThemedText style={[styles.docHeaderText, { color: c.muted }]}>BUDGET</ThemedText>
          </View>

          <View style={styles.docContent}>
            <View style={[styles.bar, { width: 100, backgroundColor: c.primary }]} />
            <View style={[styles.bar, { width: 60, backgroundColor: c.barMuted }]} />

            <View style={styles.docFooter}>
              <View style={[styles.lockCircle, { backgroundColor: c.lockIcon }]}>
                <Ionicons name="lock-closed" size={10} color="#fff" />
              </View>
              <View style={[styles.bar, { width: 80, backgroundColor: c.primaryTint, height: 6 }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: c.text }]}>Planning ahead.</ThemedText>
        <ThemedText style={[styles.subtitle, { color: c.muted }]}>
          Setup your budget for each category so you stay in absolute control of your finances.
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
  document: {
    width: 160,
    height: 180,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
    justifyContent: 'space-between',
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docHeaderText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  docContent: {
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  docFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  lockCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
