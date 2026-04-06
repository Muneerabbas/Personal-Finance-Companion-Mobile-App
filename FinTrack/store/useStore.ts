import { create } from 'zustand';
import {
  addTransaction as apiAddTransaction,
  deleteTransactionById,
  getTransactions,
  updateTransactionById,
} from '@/api/transactions';
import { getGoals, addGoal as apiAddGoal, patchGoalSavedAmount } from '@/api/goals';
import { getBudget, setBudget as apiSetBudget } from '@/api/budget';
import { GOAL_SAVING_CATEGORY, isSpendingExpense } from '@/constants/transaction-category-styles';
import { createTransactionPayload, type TransactionPayload } from '@/lib/transaction-helper';
import { supabase } from '@/lib/supabase';

/** Coalesce parallel `refreshAllData` calls (e.g. tab layout + home mount). */
let refreshAllDataInFlight: Promise<void> | null = null;

/** YYYY-MM-DD in local time — matches dashboard date bucketing */
function localDateKeyFromTx(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function currentMonthKeyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface AppState {
  transactions: any[];
  goals: any[];
  monthlyBudget: number | null;
  loading: boolean;
  user: any | null;
  /** First global sync (transactions + goals + budget) finished while signed in. */
  isInitialSyncComplete: boolean;
  /** `refreshAllData` currently running. */
  syncInProgress: boolean;
  
  // Actions
  fetchUser: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (payload: any) => Promise<void>;
  updateExistingTransaction: (id: string, payload: TransactionPayload) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  /** Records a goal allocation (category goal_saving) and increases goal.saved_amount when balance allows */
  allocateToGoal: (goalId: string, amountUsd: number) => Promise<void>;
  fetchGoals: () => Promise<void>;
  addGoal: (payload: any) => Promise<void>;
  fetchBudget: () => Promise<void>;
  setBudget: (limit: number) => Promise<void>;
  /** Reload transactions, goals, and budget from the API (e.g. pull-to-refresh). */
  refreshAllData: () => Promise<void>;
  
  // Derived state getters
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
  getRemainingBudget: () => number | null;
  /** Discretionary spending (excl. goal transfers) in the current calendar month, local time. */
  getDiscretionarySpentThisCalendarMonth: () => number;
  getPotentialSavings: () => number | null;
}

export const useStore = create<AppState>((set, get) => ({
  transactions: [],
  goals: [],
  monthlyBudget: null,
  loading: false,
  user: null,
  isInitialSyncComplete: false,
  syncInProgress: false,

  fetchUser: async () => {
    await supabase.auth.refreshSession().catch(() => {});
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null });
  },

  fetchTransactions: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    set({ user });
    set({ loading: true });
    try {
      const data = await getTransactions();
      set({ transactions: data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (payload) => {
    set({ loading: true });
    try {
      const newTx = await apiAddTransaction(payload);
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateExistingTransaction: async (id, payload) => {
    set({ loading: true });
    try {
      const updated = await updateTransactionById(id, payload);
      set((state) => ({
        transactions: state.transactions.map((t) => (String(t.id) === String(id) ? updated : t)),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeTransaction: async (id) => {
    set({ loading: true });
    try {
      await deleteTransactionById(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => String(t.id) !== String(id)),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  allocateToGoal: async (goalId: string, amountUsd: number) => {
    const amount = Number(amountUsd);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Enter a valid amount');
    }
    const net = get().getNetBalance();
    if (amount > net + 1e-6) {
      throw new Error('Insufficient balance');
    }
    const goal = get().goals.find((g) => String(g.id) === String(goalId));
    if (!goal) {
      throw new Error('Goal not found');
    }

    const payload = createTransactionPayload({
      amount,
      type: 'expense',
      category: GOAL_SAVING_CATEGORY,
      note: `Saved for ${goal.title}`,
      wallet: 'Goals',
      customCategory: '',
    });

    set({ loading: true });
    try {
      const newTx = await apiAddTransaction(payload);
      const prevSaved = Number(goal.saved_amount) || 0;
      const updatedRow = await patchGoalSavedAmount(goalId, prevSaved + amount);

      set((state) => ({
        transactions: [newTx, ...state.transactions],
        goals: state.goals.map((g) =>
          String(g.id) === String(goalId) ? { ...g, ...updatedRow } : g,
        ),
      }));
    } catch (error) {
      await get().fetchTransactions().catch(() => {});
      await get().fetchGoals().catch(() => {});
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchGoals: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    set({ user });
    set({ loading: true });
    try {
      const data = await getGoals();
      set({ goals: data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  addGoal: async (payload) => {
    set({ loading: true });
    try {
      const newGoal = await apiAddGoal(payload);
      set((state) => ({ goals: [...state.goals, newGoal] }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchBudget: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    set({ user });
    set({ loading: true });
    try {
      const data = await getBudget();
      set({ monthlyBudget: data?.monthly_limit ?? null });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  refreshAllData: async () => {
    if (refreshAllDataInFlight) {
      return refreshAllDataInFlight;
    }
    refreshAllDataInFlight = (async () => {
      set({ syncInProgress: true });
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let user = session?.user ?? null;
        if (!user) {
          const {
            data: { user: u },
          } = await supabase.auth.getUser();
          user = u ?? null;
        }
        if (!user) {
          set({ isInitialSyncComplete: false });
          return;
        }
        set({ user });

        const [txResult, goalsResult, budgetResult] = await Promise.allSettled([
          getTransactions(),
          getGoals(),
          getBudget(),
        ]);

        const patch: Partial<Pick<AppState, 'transactions' | 'goals' | 'monthlyBudget'>> = {};
        if (txResult.status === 'fulfilled') {
          patch.transactions = txResult.value;
        } else {
          console.error(txResult.reason);
        }
        if (goalsResult.status === 'fulfilled') {
          patch.goals = goalsResult.value;
        } else {
          console.error(goalsResult.reason);
        }
        if (budgetResult.status === 'fulfilled') {
          patch.monthlyBudget = budgetResult.value?.monthly_limit ?? null;
        } else {
          console.error(budgetResult.reason);
        }
        set({ ...patch, isInitialSyncComplete: true });
      } finally {
        set({ syncInProgress: false });
        refreshAllDataInFlight = null;
      }
    })();
    return refreshAllDataInFlight;
  },

  setBudget: async (limit) => {
    set({ loading: true });
    try {
      const data = await apiSetBudget(limit);
      set({ monthlyBudget: data.monthly_limit });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getTotalIncome: () => {
    const { transactions } = get();
    return transactions.reduce((acc, curr) => {
      return curr.amount > 0 ? acc + Number(curr.amount) : acc;
    }, 0);
  },

  getTotalExpenses: () => {
    const { transactions } = get();
    return transactions.reduce((acc, curr) => {
      return isSpendingExpense(curr) ? acc + Math.abs(Number(curr.amount)) : acc;
    }, 0);
  },

  /** Income minus all outflows (including goal allocations). Used for allocate checks and true cash position. */
  getNetBalance: () => {
    const { transactions } = get();
    let income = 0;
    let out = 0;
    for (const curr of transactions) {
      const a = Number(curr.amount);
      if (a > 0) income += a;
      else if (a < 0) out += Math.abs(a);
    }
    return income - out;
  },

  getDiscretionarySpentThisCalendarMonth: () => {
    const { transactions } = get();
    const monthKey = currentMonthKeyLocal();
    let sum = 0;
    for (const tx of transactions) {
      if (!tx.date || !isSpendingExpense(tx)) continue;
      const key = localDateKeyFromTx(tx.date);
      if (key.slice(0, 7) !== monthKey) continue;
      sum += Math.abs(Number(tx.amount));
    }
    return sum;
  },

  getRemainingBudget: () => {
    const { monthlyBudget } = get();
    if (!monthlyBudget) return null;
    const spentMtd = get().getDiscretionarySpentThisCalendarMonth();
    return Number(monthlyBudget) - spentMtd;
  },
  
  getPotentialSavings: () => {
    const remaining = get().getRemainingBudget();
    const net = get().getNetBalance();
    
    // Potential savings could be remainder of budget if they don't overspend, or their actual net balance
    if (remaining !== null) {
        return net >= 0 ? net : 0;
    }
    return net;
  }
}));
