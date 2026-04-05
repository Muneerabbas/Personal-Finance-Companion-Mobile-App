import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/** Default backdrop for app sheets (tap outside to close). */
export function renderSheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.45}
      pressBehavior="close"
    />
  );
}

/** Root wrapper: gesture handler + @gorhom/bottom-sheet modal host. */
export function BottomSheetProvider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export { BottomSheetFlatList, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView };
