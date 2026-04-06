import {
  GOAL_SAVING_CATEGORY,
  OTHER_CATEGORY_LABEL,
  visualForCategory,
} from '@/constants/transaction-category-styles';
import { type Transaction } from '@/components/home/TransactionItem';

export function generateId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type CreateTransactionParams = {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  wallet?: string;
  customCategory?: string;
};

export type TransactionPayload = {
  id: string;
  amount: number;
  category: string;
  note: string;
  createdAt: string;
  type: 'income' | 'expense';
  wallet: string;
  customCategory: string;
};

export function createTransactionPayload({
  amount,
  type,
  category,
  note,
  wallet = '',
  customCategory = '',
}: CreateTransactionParams): TransactionPayload {
  const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  return {
    id: generateId(),
    amount: finalAmount,
    category,
    note,
    createdAt: new Date().toISOString(),
    type,
    wallet,
    customCategory,
  };
}

/** Same as create payload but preserves id and createdAt for Supabase updates. */
export function createTransactionPayloadForUpdate(
  params: CreateTransactionParams,
  existing: { id: string; createdAt: string },
): TransactionPayload {
  const base = createTransactionPayload(params);
  return { ...base, id: existing.id, createdAt: existing.createdAt };
}

export function mapPayloadToUITransaction(payload: TransactionPayload): Transaction {
  const isOther = payload.category === OTHER_CATEGORY_LABEL;
  const resolvedCategory = isOther 
    ? (payload.customCategory.trim() || OTHER_CATEGORY_LABEL) 
    : payload.category;

  const v = visualForCategory(resolvedCategory, payload.type === 'expense' ? 'expense' : 'income', isOther);
  const paymentMethod =
    payload.wallet.trim() ||
    (resolvedCategory === GOAL_SAVING_CATEGORY
      ? 'Goal'
      : payload.type === 'income'
        ? 'Income'
        : 'Expense');
  
  return {
    id: payload.id,
    title: payload.note.trim() || resolvedCategory,
    category: resolvedCategory,
    timeLabel: new Date(payload.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    amount: payload.amount,
    paymentMethod,
    icon: v.icon,
    iconBackground: v.iconBackground,
    iconColor: v.iconColor,
    ...(v.isOtherCategory ? { isOtherCategory: true } : {}),
  };
}
