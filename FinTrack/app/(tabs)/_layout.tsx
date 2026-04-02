import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  BudgetTabIcon,
  HomeTabIcon,
  PlusTabIcon,
  ProfileTabIcon,
  TransactionTabIcon,
} from '@/components/ui/tab-icons';

type AnimatedTabIconProps = {
  focused: boolean;
  children: React.ReactNode;
  isAddButton?: boolean;
};

function AnimatedTabIcon({
  focused,
  children,
  isAddButton = false,
}: AnimatedTabIconProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  }, [focused, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isAddButton ? 0.9 + progress.value * 0.1 : 0.55 + progress.value * 0.45,
  }));

  return <Animated.View style={[styles.iconWrap, animatedStyle]}>{children}</Animated.View>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const safeBottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10);
  const tabBarBottom = 0;
  const tabBarHeight = 92 + safeBottomInset;
  const tabBarPaddingBottom = Math.max(safeBottomInset, 10);
  const centerButtonBottom = tabBarPaddingBottom +42;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          headerShown: false,
          animation: 'fade',
          tabBarButton: HapticTab,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: theme.tabBarBackground,
              height: tabBarHeight,
              paddingBottom: tabBarPaddingBottom,
              bottom: tabBarBottom,
            },
          ],
          tabBarBackground: () => (
            <View
              style={[
                styles.tabBarBackground,
                {
                  backgroundColor: theme.tabBarBackground,
                },
              ]}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: Fonts.sans,
            fontSize: 9,
            marginTop: 2,
            marginBottom: Platform.OS === 'ios' ? 4 : 6,
          },
          tabBarItemStyle: styles.tabItem,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <HomeTabIcon color={String(color)} size={29} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="transaction"
          options={{
            title: 'Transaction',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <TransactionTabIcon color={String(color)} size={29} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarButton: ({ accessibilityLabel, accessibilityState, onLongPress, onPress, testID }) => (
              <Pressable
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityState={accessibilityState}
                onPress={() => setFabOpen((prev) => !prev)}
                onLongPress={onLongPress}
                style={styles.addTabSpacer}
                testID={testID}
              />
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <BudgetTabIcon color={String(color)} size={29} />
              </AnimatedTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Challenges',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused}>
                <ProfileTabIcon color={String(color)} size={29} />
              </AnimatedTabIcon>
            ),
          }}
        />
      </Tabs>

      {fabOpen ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Pressable style={styles.backdrop} onPress={() => setFabOpen(false)} />
          <View
            pointerEvents="box-none"
            style={[
              styles.actionCluster,
              {
                bottom: centerButtonBottom,
              },
            ]}>
            <Pressable style={[styles.actionButton, styles.actionBlue]} onPress={() => setFabOpen(false)}>
              <MaterialCommunityIcons name="swap-horizontal" size={28} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionGreen]} onPress={() => setFabOpen(false)}>
              <MaterialCommunityIcons name="wallet-plus-outline" size={28} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionRed]} onPress={() => setFabOpen(false)}>
              <MaterialCommunityIcons name="help" size={30} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setFabOpen((prev) => !prev)}
        style={[
          styles.centerButton,
          {
            backgroundColor: theme.primary,
            bottom: centerButtonBottom,
          },
        ]}>
        <View style={fabOpen ? styles.fabIconOpen : undefined}>
          <PlusTabIcon color="#FFFFFF" size={32} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 92,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarBackground: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#1F1B2F',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    paddingTop: 8,
    paddingBottom: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  addTabSpacer: {
    width: 84,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F3DFF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 16,
  },
  actionCluster: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    pointerEvents: 'box-none',
  },
  actionButton: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F1B2F',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 12,
  },
  actionBlue: {
    backgroundColor: '#1A73E8',
    transform: [{ translateX: -72 }, { translateY: -54 }],
  },
  actionGreen: {
    backgroundColor: '#13B36B',
    transform: [{ translateX: 0 }, { translateY: -86 }],
  },
  actionRed: {
    backgroundColor: '#FF4D5E',
    transform: [{ translateX: 72 }, { translateY: -54 }],
  },
  fabIconOpen: {
    transform: [{ rotate: '45deg' }],
  },
});
