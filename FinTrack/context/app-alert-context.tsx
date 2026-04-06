import React, { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void | Promise<void>;
};

export type AppAlertOptions = {
  title: string;
  message?: string;
  /** Omit for a single “OK” action. */
  buttons?: AppAlertButton[];
};

type AppAlertContextValue = {
  showAlert: (options: AppAlertOptions) => void;
  dismissAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

const DEFAULT_OK: AppAlertButton[] = [{ text: 'OK', style: 'default' }];

function CustomAlertModal({
  visible,
  options,
  onRequestClose,
  onButtonPress,
}: {
  visible: boolean;
  options: AppAlertOptions | null;
  onRequestClose: () => void;
  onButtonPress: (button: AppAlertButton) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const cardMaxWidth = Math.min(340, width - 48);

  if (!options) return null;

  const buttons = options.buttons?.length ? options.buttons : DEFAULT_OK;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}>
      <Pressable style={styles.overlay} onPress={onRequestClose} accessibilityRole="button">
        <Pressable
          style={[
            styles.card,
            {
              maxWidth: cardMaxWidth,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal>
          <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={4}>
            {options.title}
          </ThemedText>
          {options.message ? (
            <Text style={[styles.message, { color: theme.muted }]} numberOfLines={12}>
              {options.message}
            </Text>
          ) : null}

          <View style={styles.buttonArea}>
            {buttons.length === 1 ? (
              <Pressable
                onPress={() => onButtonPress(buttons[0])}
                style={({ pressed }) => [
                  styles.singleButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={buttons[0].text}>
                <Text style={[styles.singleButtonLabel, { color: '#FFFFFF' }]}>{buttons[0].text}</Text>
              </Pressable>
            ) : buttons.length === 2 ? (
              <View style={styles.rowTwo}>
                {buttons.map((btn, i) => {
                  const isCancel = btn.style === 'cancel';
                  const isDest = btn.style === 'destructive';
                  return (
                    <Pressable
                      key={`${btn.text}-${i}`}
                      onPress={() => onButtonPress(btn)}
                      style={({ pressed }) => [
                        styles.halfButton,
                        isCancel && {
                          backgroundColor: isDark ? '#2A3045' : '#F3F4F6',
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                        !isCancel &&
                          !isDest && {
                            backgroundColor: theme.primary,
                          },
                        isDest && {
                          backgroundColor: isDark ? 'rgba(248,113,113,0.2)' : '#FEE2E2',
                        },
                        { opacity: pressed ? 0.88 : 1 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={btn.text}>
                      <Text
                        style={[
                          styles.halfButtonLabel,
                          {
                            color: isCancel
                              ? theme.muted
                              : isDest
                                ? isDark
                                  ? '#F87171'
                                  : '#DC2626'
                                : '#FFFFFF',
                          },
                        ]}
                        numberOfLines={1}>
                        {btn.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.columnMany}>
                {buttons.map((btn, i) => {
                  const isCancel = btn.style === 'cancel';
                  const isDest = btn.style === 'destructive';
                  return (
                    <Pressable
                      key={`${btn.text}-${i}`}
                      onPress={() => onButtonPress(btn)}
                      style={({ pressed }) => [
                        styles.stackedButton,
                        isCancel && {
                          backgroundColor: 'transparent',
                          borderWidth: 1.5,
                          borderColor: theme.border,
                        },
                        !isCancel &&
                          !isDest && {
                            backgroundColor: theme.primary,
                          },
                        isDest && {
                          backgroundColor: isDark ? 'rgba(248,113,113,0.2)' : '#FEE2E2',
                        },
                        { opacity: pressed ? 0.88 : 1 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={btn.text}>
                      <Text
                        style={[
                          styles.stackedButtonLabel,
                          {
                            color: isCancel
                              ? theme.text
                              : isDest
                                ? isDark
                                  ? '#F87171'
                                  : '#DC2626'
                                : '#FFFFFF',
                          },
                        ]}
                        numberOfLines={1}>
                        {btn.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AppAlertOptions | null>(null);
  const optionsRef = useRef<AppAlertOptions | null>(null);
  optionsRef.current = options;

  const dismissAlert = useCallback(() => {
    setVisible(false);
    setOptions(null);
  }, []);

  const showAlert = useCallback((next: AppAlertOptions) => {
    setOptions(next);
    setVisible(true);
  }, []);

  const onRequestClose = useCallback(() => {
    const current = optionsRef.current;
    const cancel = current?.buttons?.find((b) => b.style === 'cancel');
    if (cancel?.onPress) void Promise.resolve(cancel.onPress());
    dismissAlert();
  }, [dismissAlert]);

  const onButtonPress = useCallback(
    (button: AppAlertButton) => {
      dismissAlert();
      requestAnimationFrame(() => {
        if (button.onPress) void Promise.resolve(button.onPress());
      });
    },
    [dismissAlert],
  );

  const value = useMemo(
    () => ({
      showAlert,
      dismissAlert,
    }),
    [showAlert, dismissAlert],
  );

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <CustomAlertModal
        visible={visible}
        options={options}
        onRequestClose={onRequestClose}
        onButtonPress={onButtonPress}
      />
    </AppAlertContext.Provider>
  );
}

export function useAppAlert(): AppAlertContextValue {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonArea: {
    gap: 10,
  },
  singleButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButtonLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  halfButtonLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  columnMany: {
    gap: 10,
  },
  stackedButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  stackedButtonLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
});
