import type { Transaction } from '@/components/home/TransactionItem';

import { OTHER_CATEGORY_LABEL, visualForCategory } from '@/constants/transaction-category-styles';

export type AddTransactionInput = {
  kind: 'income' | 'expense';
  categorySelection: string;
  customCategory: string;
  description: string;
  amount: number;
  wallet: string;
};

function nowTimeLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function buildTransaction(input: AddTransactionInput): Transaction {
  const isOther = input.categorySelection === OTHER_CATEGORY_LABEL;
  const category = isOther
    ? (input.customCategory.trim() || OTHER_CATEGORY_LABEL)
    : input.categorySelection;
  const title = input.description.trim() || category;
  const abs = Math.abs(input.amount);
  const amount = input.kind === 'expense' ? -abs : abs;
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const v = visualForCategory(category, input.kind, isOther);
  const paymentMethod = input.wallet.trim() || (input.kind === 'income' ? 'Income' : 'Expense');

  return {
    id,
    title,
    category,
    timeLabel: nowTimeLabel(),
    amount,
    paymentMethod,
    icon: v.icon,
    iconBackground: v.iconBackground,
    iconColor: v.iconColor,
    ...(v.isOtherCategory ? { isOtherCategory: true } : {}),
  };
}
