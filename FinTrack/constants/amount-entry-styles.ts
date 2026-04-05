import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';

const AMOUNT_SIZE = 52;
const AMOUNT_LINE = 56;

export const amountEntryStyles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 64,
    gap: 4,
  },
  symbolWrap: {
    height: AMOUNT_LINE,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: AMOUNT_SIZE,
    lineHeight: AMOUNT_LINE,
    fontFamily: Fonts.bold,
    textAlign: 'right',
  },
  inputOuter: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 64,
    position: 'relative',
  },
  amountPlaceholder: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    color: 'rgba(255,255,255,0.45)',
    fontSize: AMOUNT_SIZE,
    lineHeight: AMOUNT_LINE,
    fontFamily: Fonts.bold,
  },
  amountInput: {
    width: '100%',
    height: AMOUNT_LINE,
    minWidth: 80,
    color: '#FFFFFF',
    fontSize: AMOUNT_SIZE,
    lineHeight: AMOUNT_LINE,
    fontFamily: Fonts.bold,
    padding: 0,
    margin: 0,
    textAlignVertical: 'bottom',
  },
});
