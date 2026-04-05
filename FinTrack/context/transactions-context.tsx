import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Transaction } from '@/components/home/TransactionItem';
import { dashboardMock } from '@/data/dashboard-mock';
import { mapPayloadToUITransaction, type TransactionPayload } from '@/lib/transaction-helper';

type TransactionsContextValue = {
  transactions: Transaction[];
  addTransaction: (payload: TransactionPayload) => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => [...dashboardMock.transactions]);

  const addTransaction = useCallback(async (payload: TransactionPayload) => {
    const row = mapPayloadToUITransaction(payload);
    setTransactions((prev) => [row, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      addTransaction,
    }),
    [transactions, addTransaction],
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error('useTransactions must be used within TransactionsProvider');
  }
  return ctx;
}
