import type { TimeFilter } from '@/components/home/TimeFilterTabs';
import type { Transaction } from '@/components/home/TransactionItem';

import raw from './mock-dashboard.json';

export type SpendingPoint = {
  value: number;
  label: string;
  amountUsd: number;
};

export type DashboardMock = {
  defaultTimeFilter: TimeFilter;
  balance: { amountUsd: number; trend: string };
  incomeExpense: { incomeUsd: number; expensesUsd: number };
  spendingTrends: Record<TimeFilter, SpendingPoint[]>;
  chart: { activeIndexByFilter: Record<TimeFilter, number> };
  transactionCategories: string[];
  incomeCategories: string[];
  wallets: string[];
  transactions: Transaction[];
};

export const dashboardMock = raw as DashboardMock;

export const HOME_RECENT_TRANSACTION_COUNT = 4;
