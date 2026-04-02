import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type BalanceCardProps = {
  amount: string;
};

export default function BalanceCard({ amount }: BalanceCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Balance</Text>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 40,
    color: '#111827',
    letterSpacing: 0.5,
  },
});
