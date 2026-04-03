import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY } from '@/app/onboarding';

const { width } = Dimensions.get('window');

export function Slide1() {
  return (
    <View style={styles.container}>
      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        <View style={styles.circle}>
          {/* Bar Chart Representation */}
          <View style={styles.barsContainer}>
            <View style={[styles.bar, { height: 24 }]} />
            <View style={[styles.bar, { height: 40 }]} />
            <View style={[styles.bar, { height: 60, backgroundColor: PRIMARY }]} />
          </View>
          {/* Overlay Line/Point */}
          <View style={styles.point} />
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Gain total <Text style={styles.highlight}>control</Text> {'\n'}of your money.
        </Text>
        <Text style={styles.subtitle}>
          Become your own money manager and make every cent count with our editorial financial tools.
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
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3E8FF', // Light purple
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
    backgroundColor: '#D8B4FE', // Lighter purple for inactive bars
    borderRadius: 4,
  },
  point: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: '#fff',
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
  highlight: {
    color: PRIMARY,
    fontStyle: 'italic',
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
