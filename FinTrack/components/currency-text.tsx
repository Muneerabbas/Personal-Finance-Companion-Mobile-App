import { Text, type TextProps } from 'react-native';

import { useCurrency } from '@/context/currency-context';

type CurrencyTextProps = Omit<TextProps, 'children'> & {
  /** Amount stored in USD (app base). */
  amountUsd: number;
  /** When true, prefix + for income / positive and − for expense-style negatives. */
  signed?: boolean;
};

/**
 * Formats a USD-stored amount in the user’s selected display currency.
 */
export function CurrencyText({ amountUsd, signed = false, style, ...rest }: CurrencyTextProps) {
  const { formatUsd } = useCurrency();
  if (signed && amountUsd !== 0) {
    const formatted = formatUsd(Math.abs(amountUsd));
    const text = amountUsd < 0 ? `−${formatted}` : `+${formatted}`;
    return (
      <Text style={style} {...rest}>
        {text}
      </Text>
    );
  }
  return (
    <Text style={style} {...rest}>
      {formatUsd(amountUsd)}
    </Text>
  );
}
