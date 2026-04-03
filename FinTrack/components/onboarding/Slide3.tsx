import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY } from '@/app/onboarding';

const { width } = Dimensions.get('window');

export function Slide3() {
  return (
    <View style={styles.container}>
      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.monthlySpendLabel}>MONTHLY SPEND</Text>
        <Text style={styles.spendAmount}>$4,250</Text>
        
        <View style={styles.chartContainer}>
          <View style={[styles.bar, { height: 30 }]} />
          <View style={[styles.bar, { height: 50 }]} />
          <View style={[styles.bar, { height: 40 }]} />
          <View style={[styles.activeBar, { height: 80 }]} />
          <View style={[styles.bar, { height: 60 }]} />
          <View style={[styles.bar, { height: 30 }]} />
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Know where your money goes.
        </Text>
        <Text style={styles.subtitle}>
          Track your transaction easily, with categories and financial report.
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
  monthlySpendLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  spendAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 32,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 14,
    backgroundColor: '#F3E8FF', // Very light purple
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  activeBar: {
    width: 14,
    backgroundColor: PRIMARY,
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
