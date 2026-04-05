import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Slide1 } from '@/components/onboarding/Slide1';
import { Slide2 } from '@/components/onboarding/Slide2';
import { Slide3 } from '@/components/onboarding/Slide3';
import { Slide4 } from '@/components/onboarding/Slide4';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { getOnboardingColors } from '@/constants/onboarding-theme';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', Component: Slide1 },
  { id: '2', Component: Slide2 },
  { id: '3', Component: Slide3 },
  { id: '4', Component: Slide4 },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const c = getOnboardingColors(colorScheme);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasFinishedOnboarding', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasFinishedOnboarding', 'true');
    router.replace('/(tabs)');
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideOffset = event.nativeEvent.contentOffset.x;
    const currentActive = Math.round(slideOffset / width);
    if (currentIndex !== currentActive && currentActive >= 0 && currentActive < SLIDES.length) {
      setCurrentIndex(currentActive);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
              <Ionicons name="wallet" size={16} color="#fff" />
            </View>
            <ThemedText style={[styles.logoText, { color: theme.text }]}>FinTrack</ThemedText>
          </View>
          <Pressable onPress={handleSkip}>
            <ThemedText style={[styles.skipText, { color: theme.primary }]}>Skip</ThemedText>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => <item.Component />}
        />

        {currentIndex < 3 ? (
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {SLIDES.slice(0, 3).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: c.dotInactive },
                    currentIndex === index && [styles.activeDot, { backgroundColor: theme.primary }],
                  ]}
                />
              ))}
            </View>

            <PrimaryButton
              title={currentIndex === 0 ? 'Get Started' : 'Continue'}
              onPress={handleNext}
              style={[styles.footerPrimaryButton, { backgroundColor: theme.primary }]}
              textStyle={styles.footerPrimaryButtonText}
              rightAccessory={
                currentIndex === 0 || currentIndex === 2 ? (
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                ) : undefined
              }
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  skipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  footerPrimaryButton: {
    height: 56,
    borderRadius: 28,
  },
  footerPrimaryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
});
