import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import { CurrencyProvider } from '@/context/currency-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const user = useStore(state => state.user);
  const fetchUser = useStore(state => state.fetchUser);
  const segments = useSegments();
  const router = useRouter();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasFinishedOnboarding').then(value => {
      setHasFinishedOnboarding(value === 'true');
    });
    fetchUser().finally(() => {
      setAuthInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded && authInitialized && hasFinishedOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authInitialized, hasFinishedOnboarding]);

  useEffect(() => {
    if (!authInitialized || !fontsLoaded || hasFinishedOnboarding === null) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasFinishedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (hasFinishedOnboarding) {
      // Basic routing logic
      if (!user && !inAuthGroup && !inOnboarding) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, authInitialized, fontsLoaded, hasFinishedOnboarding]);

  if (!fontsLoaded || !authInitialized || hasFinishedOnboarding === null) {
    return null; // or a loading spinner
  }

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <CurrencyProvider>
        <BottomSheetProvider>
          <PaperProvider>
            <ThemeProvider
              value={{
                ...navigationTheme,
                colors: {
                  ...navigationTheme.colors,
                  background: theme.background,
                  card: theme.card,
                  border: theme.border,
                  text: theme.text,
                  primary: theme.primary,
                },
              }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="goals-overview" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </PaperProvider>
        </BottomSheetProvider>
      </CurrencyProvider>
    </SafeAreaProvider>
  );
}
