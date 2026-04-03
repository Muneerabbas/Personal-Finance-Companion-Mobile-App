import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Slide1 } from '@/components/onboarding/Slide1';
import { Slide2 } from '@/components/onboarding/Slide2';
import { Slide3 } from '@/components/onboarding/Slide3';
import { Slide4 } from '@/components/onboarding/Slide4';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { id: '1', Component: Slide1 },
  { id: '2', Component: Slide2 },
  { id: '3', Component: Slide3 },
  { id: '4', Component: Slide4 },
];

export const PRIMARY = '#8B5CF6';

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleScroll = (event: any) => {
    const slideOffset = event.nativeEvent.contentOffset.x;
    const currentActive = Math.round(slideOffset / width);
    if (currentIndex !== currentActive && currentActive >= 0 && currentActive < SLIDES.length) {
      setCurrentIndex(currentActive);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="wallet" size={16} color="#fff" />
            </View>
            <Text style={styles.logoText}>FinTrack</Text>
          </View>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Carousel */}
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

        {/* Footer */}
        {currentIndex < 3 ? (
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {SLIDES.slice(0, 3).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <Pressable style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {currentIndex === 0 ? 'Get Started' : 'Continue'}
              </Text>
              {(currentIndex === 0 || currentIndex === 2) && (
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              )}
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: PRIMARY,
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#111827',
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: PRIMARY,
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
    backgroundColor: '#D1D5DB', // Gray-300
  },
  activeDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY, // Purple
  },
  button: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
