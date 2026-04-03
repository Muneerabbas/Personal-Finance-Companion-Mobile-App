import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY } from '@/app/onboarding';

const { width } = Dimensions.get('window');

export function Slide2() {
  return (
    <View style={styles.container}>
      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        <View style={styles.document}>
          <View style={styles.docHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet-outline" size={14} color="#fff" />
            </View>
            <Text style={styles.docHeaderText}>BUDGET</Text>
          </View>
          
          <View style={styles.docContent}>
            <View style={[styles.bar, { width: 100, backgroundColor: PRIMARY }]} />
            <View style={[styles.bar, { width: 60, backgroundColor: '#E5E7EB' }]} />
            
            <View style={styles.docFooter}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={10} color="#fff" />
              </View>
              <View style={[styles.bar, { width: 80, backgroundColor: '#F3E8FF', height: 6 }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Planning ahead.
        </Text>
        <Text style={styles.subtitle}>
          Setup your budget for each category so you stay in absolute control of your finances.
        </Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10, // For Android
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
    backgroundColor: '#C4B5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#9CA3AF',
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
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 0,
  },
});
