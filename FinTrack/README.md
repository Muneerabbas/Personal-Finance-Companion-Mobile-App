# FinTrack - Backend & State Management Blueprint

This document acts as an explicit architectural and integrational blueprint for full-stack developers. It analyzes the existing React Native UI layer of the FinTrack application and formally maps it to actionable schema models, state management structures, and business logic flows.

---

## 1. 📱 Screen Analysis (Codebase Extraction)

Based on the actual TypeScript components mapped in `app/(tabs)` and `app/`:

### **Home Screen (`app/(tabs)/index.tsx`)**
- **Purpose**: The main central dashboard providing instant financial clarity. 
- **UI Components**: `BalanceCard`, `IncomeExpenseCard`, `BudgetCard`, `SafeToSpendCard`, `InsightsSection`, `SpendingChart`, `TransactionList`.
- **Data Displayed**: Net balance, total income vs total expenses, remaining monthly budget, daily safe-to-spend allowance, potential savings, weekly spending bars, and recent transactions.
- **User Actions**: Visual analysis, horizontal scroll of recent transactions, navigation to full transaction list.

### **Add Transaction Screen (`app/add-transaction.tsx`)**
- **Purpose**: Unified form screen to input ledger events dynamically toggling context (Income / Expense).
- **UI Components**: Top Type Toggle, `TextInput` (Amount, Description), `CategoryDropdown` (Category, Wallet), `Switch` (Repeat). 
- **Data Required**: Single unified `TransactionPayload`. Amount parsed to signed numbers natively (Expense = negative), predefined categories, wallet/payment methods.
- **User Actions**: Selecting type (Income/Expense), filling inputs, and dispatching robust `await addTransaction(payload)`. 
*(Note: "Transfer" functionality was explicitly removed to enforce a strictly tracked income vs. expense ledger framework).*

### **Transactions Screen (`app/(tabs)/transaction.tsx`)**
- **Purpose**: Historical ledger view. 
- **UI Components**: Text search field, `TransactionFilter` pills (All, Income, Expense), date-grouped list sections.
- **Data Displayed**: Flat list of transactions segmented strictly by date headers ("Recent Activity", "Earlier This Week", "Earlier This Month").
- **User Actions**: Searching text descriptions natively, toggling expense vs income filters, infinite scrolling list.

### **Insights Screen (`app/(tabs)/budget.tsx`)**
- **Purpose**: In-depth analytical views of expenditure ("Financial insights").
- **UI Components**: Ring segment SVG charts, Weekly trend comparison cards, Top Category highlights.
- **Data Displayed**: Percentage breakdown of expenses per category, comparison percentages vs previous time windows (`previousTotal` vs `currentTotal`), estimated average daily spend.
- **User Actions**: Visual analysis, discovering "Smart Predictions" recommending actionable cuts to budget allocation.

### **Challenges (Goals) Screen (`app/(tabs)/challenges.tsx`)**
- **Purpose**: Tracks long-term financial milestones and goal-based budgeting.
- **UI Components**: `GoalCard` (Active goal, progress bar), `BudgetCard` (Monthly budget utilization ring), `MilestoneItem` (Upcoming goals).
- **Data Displayed**: Total target amount, progress amount, percentage utilized, progress bars visually mapping completion rate.
- **User Actions**: Reviewing active/upcoming financial goals, viewing customized AI insights for adjusting goal progress.

---

## 2. 🧩 Component Breakdown

Core reusable presentation components identified in `components/`:

- **Card Wrappers (`components/home/*`)**: Reusable summary cards (`BalanceCard`, `BudgetCard`, etc.). All expect raw USD amounts (not formatted strings) and handle their own localization format logic. Do not pass stringified currencies to these via state.
- **`CategoryDropdown` (`components/ui/category-dropdown.tsx`)**: Requires a structured set of options, but internally handles an "Other" override state. The state management layer *must* support storing strings apart from strict Enums to support this.
- **`CurrencyText` (`components/currency-text.tsx`)**: Relies directly on `CurrencyContext` for its prefix. Ensures a clean separation between raw floating-point storage values and UI presentation.

---

## 3. 🧾 Data Models (Based on UI Needs)

To satisfy the parameters parsed by the UI components, implement the following models in your database and backend (Prisma/TypeORM schemas should mirror this). 

### **Transaction Model**
```typescript
interface Transaction {
  id: string;             // UUID 
  title: string;          // Maps to 'description' input
  amount: number;         // Float. Positive = Income, Negative = Expense
  category: string;       // E.g., 'Food', 'Transport', or custom 'Other' inputs.
  isOtherCategory: boolean;// Flag indicating if this was a custom category string
  paymentMethod: string;  // Wallet identifier (e.g. 'Main Card', 'Cash')
  icon: string;           // Fallback Ionicon string (e.g. 'cart') if specific mapping fails
  iconBackground: string; // Specific static hex color corresponding to category
  iconColor: string;      // Specific static hex color corresponding to category
  timeLabel: string;      // Timestamp ISO format (Needs standardized DB standard -> UI localized format)
  createdAt: Date; 
}
```

### **Goal / Challenge Model**
```typescript
interface Goal {
  id: string;
  title: string;
  targetAmount: number;    // E.g., 1000 for "New iPhone"
  savedAmount: number;     // Currently allocated funds towards goal
  deadline: Date | null;   // To compute completion estimations
  icon: string;            // E.g. 'airplane' for travel
  isPrimary: boolean;      // Used to highlight the main 'Active Goal' 
}
```

### **Budget Config Model**
```typescript
interface Budget {
  monthlyLimit: number;    // E.g., 2500. Currently hardcoded globally in index.tsx
}
```

---

## 4. 🧠 Derived Calculations (CRITICAL)

**DO NOT STORE THESE VALUES IN THE DATABASE**. These must be strictly computed at the selector level upon querying raw transactions.

- **`totalIncome`**: `sum(tx.amount)` where `tx.amount > 0`
- **`totalExpenses`**: `sum(Math.abs(tx.amount))` where `tx.amount < 0`
- **`netBalance`**: `totalIncome - totalExpenses`
- **`remainingBudget`**: `budget.monthlyLimit - totalExpenses`
- **`potentialSavings`**: `totalIncome - budget.monthlyLimit`
- **`safeToSpendPerDay`**: `remainingBudget / daysLeftInMonth`

*Why*: Current React Components natively calculate this right inside the functional component lifecycle (e.g., `app/(tabs)/index.tsx`, `useMemo` block). To optimize performance when moving to a backend context, shift these to memoized global selectors (Zustand/Redux).

---

## 5. 🔄 Data Flow (Realistic Implementation)

Follow this immutable, one-way data flow mapping:

1. **User Action**: User submits the unified transaction form (`app/add-transaction.tsx`).
2. **Action Dispatch**: Component inherently formats `createTransactionPayload` (applying explicit sign negation based on type) and triggers async `addTransaction(payload)`.
3. **Optimistic UI**: Temporarily append transaction to local Zustand store.
4. **Network Layer**: POST to backend API `/v1/transactions`. 
5. **State Update**: Receive canonical ID and timestamp from server, patch local state. 
6. **Derived Recalculation**: App's centralized `selectNetBalance` and `selectTotalExpenses` instantly recalculate. 
7. **UI Hydration**: `BalanceCard` and `InsightsSection` seamlessly re-render their UI states. 

---

## 6. 🏗 State Management Plan

**Recommended Library**: Zustand (or Redux Toolkit). 

### Store Structure
```typescript
interface AppState {
  // Entities
  transactions: Transaction[];
  goals: Goal[];
  monthlyBudget: number;

  // Actions
  fetchTransactions: (month: string) => Promise<void>;
  addTransaction: (tx: Partial<Transaction>) => Promise<void>;
  updateBudget: (limit: number) => Promise<void>;
  
  // Computed / Selectors (Preferably wrap in derived selector hooks)
  getIncome: () => number;
  getExpenses: () => number;
  getBalance: () => number;
  getTransactionsByCategory: () => Record<string, number>;
}
```

---

## 7. 🎯 UI → Logic Mapping

Here is exactly where each logic entity will live inside the pre-existing screens:

- **`app/(tabs)/index.tsx`**: Replace the current `let income = 0` internal mapping with store selectors. Feed `totalIncome`, `totalExpenses`, and `safeToSpend` via `useStore()`.
- **`app/add-transaction.tsx`**: A unified dynamic view replacing the old fragmented forms. It utilizes explicit data structuring (`createTransactionPayload`) ensuring all expenses are inherently treated as negative integers natively before making the global asynchronous `addTransaction` commit.
- **`app/(tabs)/transaction.tsx`**: Currently building `sections` by looping local data manually. Keep the textual search filtering client-side for immediate response, but handle date segmenting dynamically via a helper attached to the unified store. 
- **`app/(tabs)/budget.tsx`**: The Insight graph requires `categorySlices`. Move the local map reduction inside `totalExpenses` mapping directly to a dedicated `selectCategorySlices` memoized function to prevent UI thread blocking on heavily populated accounts. 
- **`app/(tabs)/challenges.tsx`**: Swap hardcoded `.4` values and `$1000` integers with actual queries subscribing to the `goals` table/state array.

---

## 8. ⚠️ Key Architectural Decisions & Restrictions

1. **Balance Is A Dynamic Output, Not State**: Balance should *never* exist as a mutable DB field or static state integer. It must always be calculated iteratively from ledger history.
2. **Savings ≠ Balance**: Do not confuse `potentialSavings` (Income against budget limits) with actual physical `netBalance`. Treat them uniquely in queries. 
3. **Standardize UTC Dates**: The `app/(tabs)/transaction.tsx` utilizes aggressive local date string parsing regex (`parseTransactionDate`). When API sync is added, switch strictly to `createdAt` ISO-8601 strings, keeping frontend manipulations completely dependent on raw valid timestamps.

---

## 9. 🧪 Edge Case Handling

Make sure the backend and states enforce gracefully rendering the following scenarios already handled visually:

- **Empty State**: Ensure `totalIncome` and `totalExpenses` return `0` safely without crashing so the Dashboard falls back to its empty state prompt gracefully instead of rendering `NaN`.
- **Negative Balance / Budget Exceeded**: `remainingBudget` uses `Math.max(0, budget - totalExpenses)` natively. Maintain this clamping logic in derived calculations to prevent confusing negative visual bug rendering for end-users relying on safe-to-spend limits.
- **No Categories Exist**: UI's `ringSegments` requires at least one default slice. Provide an "Other" generic layout by default.

---

## 10. 🚀 Future Integrations 

As state management scales logically, consider adding:
1. **Multi-Account Contextualizing**: Wrapping entire queries in `accountId` dimensions for shared family plans.
2. **Local-First SQLite caching**: Converting global store arrays into WatermelonDB synced queries.
3. **AI Insight Streams**: Push logic via websocket mapping personalized saving suggestions into `app/(tabs)/challenges.tsx`'s `InsightCard`. 
