import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';

import PrimaryButton from '@/components/ui/primary-button';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { getOnboardingColors } from '@/constants/onboarding-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export function Slide4() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = getOnboardingColors(scheme);

  const handleSignIn = async () => {
    await AsyncStorage.setItem('hasFinishedOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleGuest = () => {
    // Guest mode currently disabled per request
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.titleContainer}>
        <ThemedText style={[styles.title, { color: c.text }]}>Level up</ThemedText>
        <ThemedText style={[styles.titleHighlight, { color: c.primary }]}>Your</ThemedText>
        <ThemedText style={[styles.titleHighlight, { color: c.primary }]}>Savings.</ThemedText>
      </View>

      <ThemedText style={[styles.subtitle, { color: c.muted }]}>
        Take on fun saving challenges and reach your financial milestones faster than ever before.
      </ThemedText>

      <View style={styles.illustrationContainer}>
        <View style={[styles.trophyContainer, { backgroundColor: c.primary }]}>
          <Ionicons name="trophy" size={32} color="#fff" />
          <View style={[styles.badge, { backgroundColor: c.badgeSurface }]}>
            <AntDesign name="star" size={10} color={c.primary} />
          </View>
        </View>
        <ThemedText style={[styles.challengeText, { color: c.text }]}>52-Week Challenge</ThemedText>
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Sign In"
          onPress={handleSignIn}
          style={[styles.googleButton, { backgroundColor: c.primary }]}
          textStyle={styles.googleButtonText}
        />

        <Pressable style={[styles.guestButton, { backgroundColor: c.guestBg }]} onPress={handleGuest}>
          <ThemedText style={[styles.guestButtonText, { color: c.primary }]}>Continue as guest</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 42,
    lineHeight: 50,
  },
  titleHighlight: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 42,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 48,
    paddingRight: 16,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  buttonsContainer: {
    gap: 16,
  },
  googleButton: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  guestButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});
