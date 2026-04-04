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
    background: '#F3F4F8',
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
    primary: '#8B7CFF',
    secondary: '#111626',
    background: '#0E1220',
    card: '#171B2B',
    border: '#232A3F',
    muted: '#8D95B2',
    tint: tintColorDark,
    icon: '#8D95B2',
    tabIconDefault: '#7D85A4',
    tabIconSelected: tintColorDark,
    tabBarBackground: '#131827',
    headerBackground: '#171B2B',
    link: '#C4B5FD',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins_400Regular',
    serif: 'Poppins_400Regular',
    rounded: 'Poppins_500Medium',
    mono: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  default: {
    sans: 'Poppins_400Regular',
    serif: 'Poppins_400Regular',
    rounded: 'Poppins_500Medium',
    mono: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  web: {
    sans: 'Poppins_400Regular',
    serif: 'Poppins_400Regular',
    rounded: 'Poppins_500Medium',
    mono: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
});
