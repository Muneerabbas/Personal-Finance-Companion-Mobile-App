import type { Transaction } from '@/components/home/TransactionItem';

export const OTHER_CATEGORY_LABEL = 'Other';

/** Internal category key for allocations moved from balance into a savings goal (stored in DB) */
export const GOAL_SAVING_CATEGORY = 'goal_saving';

/** User-facing label — not a discretionary expense */
export const GOAL_ALLOCATION_DISPLAY_LABEL = 'Towards goal';

export function isGoalAllocationCategory(category: string): boolean {
  return category === GOAL_SAVING_CATEGORY;
}

export function getCategoryDisplayLabel(category: string): string {
  if (isGoalAllocationCategory(category)) return GOAL_ALLOCATION_DISPLAY_LABEL;
  return category;
}

type Visual = Pick<Transaction, 'icon' | 'iconBackground' | 'iconColor'>;

const otherVisual: Visual = {
  icon: 'pricetag-outline',
  iconBackground: '#E8E8ED',
  iconColor: '#6B7280',
};

const incomeMap: Record<string, Visual> = {
  Salary: { icon: 'briefcase', iconBackground: '#ECFDF5', iconColor: '#047857' },
  Freelance: { icon: 'laptop-outline', iconBackground: '#EEF2FF', iconColor: '#4F46E5' },
  'Investment returns': { icon: 'trending-up', iconBackground: '#DCFCE7', iconColor: '#15803D' },
  'Gifts & refunds': { icon: 'gift-outline', iconBackground: '#FEF3C7', iconColor: '#B45309' },
};

const expenseMap: Record<string, Visual> = {
  'Coffee & Dining': { icon: 'cafe', iconBackground: '#FFF4E6', iconColor: '#C2410C' },
  Electronics: { icon: 'phone-portrait', iconBackground: '#E0F2FE', iconColor: '#0369A1' },
  'Business Income': { icon: 'wallet', iconBackground: '#DCFCE7', iconColor: '#15803D' },
  Groceries: { icon: 'bag-handle', iconBackground: '#F3E8FF', iconColor: '#7C3AED' },
  Subscriptions: { icon: 'film', iconBackground: '#FEE2E2', iconColor: '#B91C1C' },
  Transport: { icon: 'car', iconBackground: '#EEF2FF', iconColor: '#4F46E5' },
  Salary: { icon: 'briefcase', iconBackground: '#ECFDF5', iconColor: '#047857' },
  Utilities: { icon: 'flash', iconBackground: '#FEF9C3', iconColor: '#CA8A04' },
  'Health & Fitness': { icon: 'barbell', iconBackground: '#F1F5F9', iconColor: '#475569' },
  Education: { icon: 'school-outline', iconBackground: '#E0F2FE', iconColor: '#0369A1' },
  Entertainment: { icon: 'musical-notes', iconBackground: '#FCE7F3', iconColor: '#BE185D' },
  'Fees & Charges': { icon: 'receipt-outline', iconBackground: '#F3F4F6', iconColor: '#4B5563' },
  Healthcare: { icon: 'medical-outline', iconBackground: '#FEE2E2', iconColor: '#DC2626' },
  'Personal Care': { icon: 'sparkles-outline', iconBackground: '#FDF2F8', iconColor: '#DB2777' },
  'Rent & Housing': { icon: 'home-outline', iconBackground: '#EDE9FE', iconColor: '#6D28D9' },
  Shopping: { icon: 'cart-outline', iconBackground: '#FFF7ED', iconColor: '#EA580C' },
  Travel: { icon: 'airplane', iconBackground: '#E0F2FE', iconColor: '#0284C7' },
  [GOAL_SAVING_CATEGORY]: {
    icon: 'flag',
    iconBackground: '#EDE9FE',
    iconColor: '#6D28D9',
  },
  Other: otherVisual,
};

const incomeFallback: Visual = {
  icon: 'cash-outline',
  iconBackground: '#DCFCE7',
  iconColor: '#15803D',
};

const expenseFallback: Visual = {
  icon: 'card-outline',
  iconBackground: '#F3E8FF',
  iconColor: '#7C3AED',
};

export function visualForCategory(
  category: string,
  kind: 'income' | 'expense',
  isOther: boolean,
): Visual & { isOtherCategory?: boolean } {
  if (isOther) {
    return { ...otherVisual, isOtherCategory: true };
  }
  if (kind === 'income') {
    return incomeMap[category] ?? incomeFallback;
  }
  return expenseMap[category] ?? expenseFallback;
}
