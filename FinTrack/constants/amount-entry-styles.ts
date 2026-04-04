import { Platform, StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';

const AMOUNT_SIZE = 52;
const AMOUNT_LINE = 56;

export const amountEntryStyles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    gap: 6,
  },
  symbolWrap: {
    height: AMOUNT_LINE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: AMOUNT_SIZE,
    lineHeight: AMOUNT_LINE,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
    textAlign: 'right',
  },
  /** Centers the fixed-height line so iOS TextInput padding doesn’t sit higher than the symbol. */
  inputOuter: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 64,
  },
  amountInput: {
    height: AMOUNT_LINE,
    width: '100%',
    color: '#FFFFFF',
    fontSize: AMOUNT_SIZE,
    lineHeight: AMOUNT_LINE,
    fontFamily: Fonts.bold,
    padding: 0,
    margin: 0,
    minWidth: 80,
    includeFontPadding: false,
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        paddingVertical: 0,
      },
      default: {},
    }),
  },
});
