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
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AppAlertProvider } from '@/context/app-alert-context';
import { BottomSheetProvider } from '@/context/bottom-sheet-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { CurrencyProvider } from '@/context/currency-context';
import { ThemePreferenceProvider } from '@/context/theme-preference-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const { isReady, session, hasCompletedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const appReady = fontsLoaded && isReady && hasCompletedOnboarding !== null;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (!appReady) return;

    const root = segments[0];
    const inAuth = root === '(auth)';
    const inOnboarding = root === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (hasCompletedOnboarding && !session?.user && !inAuth && !inOnboarding) {
      router.replace('/(auth)/login');
      return;
    }

    if (session?.user && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [appReady, hasCompletedOnboarding, session?.user, segments, router]);

  if (!appReady) {
    return null;
  }

  return (
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
            <AppAlertProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="goals-overview" options={{ headerShown: false }} />
              <Stack.Screen name="transaction-detail" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </AppAlertProvider>
          </ThemeProvider>
        </PaperProvider>
      </BottomSheetProvider>
    </CurrencyProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemePreferenceProvider>
        <KeyboardProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </KeyboardProvider>
      </ThemePreferenceProvider>
    </SafeAreaProvider>
  );
}
