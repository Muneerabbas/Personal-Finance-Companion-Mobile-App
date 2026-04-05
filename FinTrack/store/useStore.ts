import { create } from 'zustand';
import { getTransactions, addTransaction as apiAddTransaction } from '@/api/transactions';
import { getGoals, addGoal as apiAddGoal, patchGoalSavedAmount } from '@/api/goals';
import { getBudget, setBudget as apiSetBudget } from '@/api/budget';
import { GOAL_SAVING_CATEGORY } from '@/constants/transaction-category-styles';
import { createTransactionPayload } from '@/lib/transaction-helper';
import { supabase } from '@/lib/supabase';

interface AppState {
  transactions: any[];
  goals: any[];
  monthlyBudget: number | null;
  loading: boolean;
  user: any | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (payload: any) => Promise<void>;
  /** Records a goal allocation (category goal_saving) and increases goal.saved_amount when balance allows */
  allocateToGoal: (goalId: string, amountUsd: number) => Promise<void>;
  fetchGoals: () => Promise<void>;
  addGoal: (payload: any) => Promise<void>;
  fetchBudget: () => Promise<void>;
  setBudget: (limit: number) => Promise<void>;
  
  // Derived state getters
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
  getRemainingBudget: () => number | null;
  getPotentialSavings: () => number | null;
}

export const useStore = create<AppState>((set, get) => ({
  transactions: [],
  goals: [],
  monthlyBudget: null,
  loading: false,
  user: null,

  fetchUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null });
    });
  },

  fetchTransactions: async () => {
    if (!get().user) return;
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
    if (!get().user) return;
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
    if (!get().user) return;
    set({ loading: true });
    try {
      const data = await getBudget();
      if (data) set({ monthlyBudget: data.monthly_limit });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  setBudget: async (limit) => {
    set({ loading: true });
    try {
      const data = await apiSetBudget(limit);
      set({ monthlyBudget: data.monthly_limit });
    } catch (error) {
      console.error(error);
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
      return curr.amount < 0 ? acc + Math.abs(Number(curr.amount)) : acc;
    }, 0);
  },

  getNetBalance: () => {
    const { getTotalIncome, getTotalExpenses } = get();
    return getTotalIncome() - getTotalExpenses();
  },

  getRemainingBudget: () => {
    const { monthlyBudget, transactions } = get();
    if (!monthlyBudget) return null;
    
    // Only count expenses for the current month. For simplicity here, we count all.
    // In a real app, we filter by date. Assuming dashboard is current month:
    const totalExpenses = get().getTotalExpenses();
    return Number(monthlyBudget) - totalExpenses;
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
