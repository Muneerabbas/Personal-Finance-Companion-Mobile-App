import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthKeyboardScreenProps = {
  children: ReactNode;
  backgroundColor: string;
};

/**
 * Auth forms: safe areas + KeyboardAwareScrollView so focused fields stay above the keyboard
 * on iOS and Android (including edge-to-edge). Requires root `KeyboardProvider` and a dev build.
 */
export function AuthKeyboardScreen({ children, backgroundColor }: AuthKeyboardScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top', 'bottom']}>
      {Platform.OS === 'web' ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
          extraKeyboardSpace={bottomPad + 8}
          enabled>
          {children}
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
