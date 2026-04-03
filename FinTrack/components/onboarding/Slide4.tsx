import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { PRIMARY } from '@/app/onboarding';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export function Slide4() {
  const router = useRouter();

  const handleSignIn = () => {
    router.replace('/(tabs)');
  };

  const handleGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Title Text Area */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Level up</Text>
        <Text style={styles.titleHighlight}>Your</Text>
        <Text style={styles.titleHighlight}>Savings.</Text>
      </View>

      <Text style={styles.subtitle}>
        Take on fun saving challenges and reach your financial milestones faster than ever before.
      </Text>

      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        <View style={styles.trophyContainer}>
          <Ionicons name="trophy" size={32} color="#fff" />
          {/* A small star badge on the trophy can be approximated */}
          <View style={styles.badge}>
            <AntDesign name="star" size={10} color={PRIMARY} />
          </View>
        </View>
        <Text style={styles.challengeText}>52-Week Challenge</Text>
      </View>

      {/* Auth Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable style={styles.googleButton} onPress={handleSignIn}>
          <AntDesign name="google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Sign In with Google</Text>
        </Pressable>
        
        <Pressable style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestButtonText}>Continue as guest</Text>
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
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: '#1F2937',
    lineHeight: 50,
  },
  titleHighlight: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: PRIMARY,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B7280',
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
    backgroundColor: PRIMARY,
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#374151',
  },
  buttonsContainer: {
    gap: 16,
  },
  googleButton: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  guestButton: {
    backgroundColor: '#F3E8FF',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: PRIMARY,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
