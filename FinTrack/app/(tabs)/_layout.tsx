import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { InteractionManager, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { useStore } from '@/store/useStore';

type TabIconProps = {
  focused: boolean;
  children: React.ReactNode;
  isAddButton?: boolean;
};

/** Instant opacity — no Reanimated timing on tab change (keeps tab switch snappy). */
function TabIconShell({ focused, children, isAddButton = false }: TabIconProps) {
  const opacity = isAddButton ? (focused ? 1 : 0.9) : focused ? 1 : 0.55;
  return <View style={[styles.iconWrap, { opacity }]}>{children}</View>;
}

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void useStore.getState().refreshAllData();
    });
    return () => task.cancel();
  }, []);

  const safeBottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10);
  const tabBarBottom = 0;
  const tabBarHeight = 92 + safeBottomInset;
  const tabBarPaddingBottom = Math.max(safeBottomInset, 10);
  const centerButtonBottom = tabBarPaddingBottom + 42;

  const toggleFab = () => {
    router.push({ pathname: '/add-transaction', params: { type: 'expense' } });
  };

  return (
    <View style={styles.container}>
      <Tabs
        detachInactiveScreens={false}
        screenOptions={{
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          headerShown: false,
          lazy: false,
          animation: 'none',
          /** Inactive tabs skip re-renders while off-screen — faster tab switches under store updates. */
          freezeOnBlur: true,
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
              <TabIconShell focused={focused}>
                <HomeTabIcon color={String(color)} size={29} />
              </TabIconShell>
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => (
              <TabIconShell focused={focused}>
                <BudgetTabIcon color={String(color)} size={29} />
              </TabIconShell>
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
                onPress={toggleFab}
                onLongPress={onLongPress}
                style={styles.addTabSpacer}
                testID={testID}
              />
            ),
            tabBarLabel: () => null,
          }}
        />

        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, focused }) => (
              <TabIconShell focused={focused}>
                <ProfileTabIcon color={String(color)} size={29} />
              </TabIconShell>
            ),
          }}
        />
        <Tabs.Screen
          name="transaction"
          options={{
            title: 'Transaction',
            tabBarIcon: ({ color, focused }) => (
              <TabIconShell focused={focused}>
                <TransactionTabIcon color={String(color)} size={29} />
              </TabIconShell>
            ),
          }}
        />
      </Tabs>

      <View
        style={[
          styles.centerButton,
          {
            backgroundColor: theme.primary,
            bottom: centerButtonBottom,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          onPress={toggleFab}
          style={styles.centerButtonHit}>
          <PlusTabIcon color="#FFFFFF" size={32} />
        </Pressable>
      </View>
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
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F3DFF',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 16,
  },
  centerButtonHit: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
