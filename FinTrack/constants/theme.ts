/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#7F3DFF';
const tintColorDark = '#A78BFF';

export const Colors = {
  light: {
    text: '#111827',
    primary: '#7F3DFF',
    secondary: '#FFFFFF',
    background: '#F7F7FB',
    card: '#FFFFFF',
    border: '#E5E7EB',
    muted: '#9CA3AF',
    tint: tintColorLight,
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: tintColorLight,
    tabBarBackground: '#FFFFFF',
    headerBackground: '#EEE5FF',
    link: '#7F3DFF',
  },
  dark: {
    text: '#F5F5FF',
    primary: '#A78BFF',
    secondary: '#121021',
    background: '#0B0B13',
    card: '#151524',
    border: '#24243A',
    muted: '#8B8BA7',
    tint: tintColorDark,
    icon: '#8B8BA7',
    tabIconDefault: '#8B8BA7',
    tabIconSelected: tintColorDark,
    tabBarBackground: '#121021',
    headerBackground: '#1A1830',
    link: '#C4B5FD',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'Inter_400Regular',
    rounded: 'Inter_500Medium',
    mono: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'Inter_400Regular',
    rounded: 'Inter_500Medium',
    mono: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  web: {
    sans: 'Inter_400Regular',
    serif: 'Inter_400Regular',
    rounded: 'Inter_500Medium',
    mono: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
});
