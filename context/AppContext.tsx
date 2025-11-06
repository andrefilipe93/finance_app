
import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_CYCLE_SETTINGS, DEFAULT_CHART_SETTINGS } from '../constants';
import { PRELOADED_TRANSACTIONS } from '../preloadedData';
import type { Transaction, Category, Account, CycleSettings, RecurringTransaction, ChartSettings, Budget, OverallBudget, PlayerProfile, AchievementNotification } from '../types';
import { TransactionType } from '../types';
import { ALL_ACHIEVEMENTS } from '../achievements';

interface AppContextType {
  transactions: Transaction[];
  cycleTransactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (recurring: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
  isModalOpen: boolean;
  openModal: (transaction?: Transaction) => void;
  closeModal: () => void;
  transactionToEdit: Transaction | null;
  cycleSettings: CycleSettings;
  updateCycleSettings: (settings: CycleSettings) => void;
  currentCycle: { start: Date; end: Date };
  importData: (data: any) => { success: boolean; message: string };
  chartSettings: ChartSettings;
  updateChartSettings: (settings: ChartSettings) => void;

  // For the new step-by-step transaction button
  isAddTransactionModalOpen: boolean;
  openAddTransactionModal: () => void;
  closeAddTransactionModal: () => void;
  transactionToEditInFlow: Transaction | null;
  openAddTransactionModalForEdit: (transaction: Transaction) => void;
  openTransactionModalForDuplication: (transaction: Transaction) => void;
  
  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  isBudgetModalOpen: boolean;
  openBudgetModal: (budget?: Budget, cycle?: string) => void;
  closeBudgetModal: () => void;
  budgetToEdit: Budget | null;
  budgetCreationCycle: string | null;

  // Budget Planning
  overallBudgets: OverallBudget[];
  saveOverallBudget: (budget: OverallBudget) => void;
  deleteOverallBudget: (cycle: string) => void;
  categoryAverages: Map<string, number>;
  
  // Gamification
  playerProfile: PlayerProfile;
  xpForNextLevel: number;
  allAchievements: typeof ALL_ACHIEVEMENTS;
  achievementNotification: AchievementNotification;
  clearAchievementNotification: () => void;

  // Centralized Account Details
  accountDetails: Map<string, { transactionCount: number; currentBalance: number }>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const getCurrentCycleDates = (settings: CycleSettings): { start: Date, end: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getMonthlyStartDate = (year: number, month: number): Date => {
        const { monthlyStartType, startDay } = settings;

        if (monthlyStartType === 'fixed') {
            return new Date(year, month, startDay);
        }
        
        const targetWeekday = startDay; // 0-6

        if (monthlyStartType === 'first_weekday') {
            const firstDayOfMonth = new Date(year, month, 1);
            const firstDayWeekday = firstDayOfMonth.getDay();
            let dayOffset = targetWeekday - firstDayWeekday;
            if (dayOffset < 0) dayOffset += 7;
            return new Date(year, month, 1 + dayOffset);
        } else { // 'last_weekday'
            const lastDayOfMonth = new Date(year, month + 1, 0);
            const lastDayWeekday = lastDayOfMonth.getDay();
            
            let diff = lastDayWeekday - targetWeekday;
            if (diff < 0) diff += 7;
            
            const resultDate = new Date(lastDayOfMonth);
            resultDate.setDate(lastDayOfMonth.getDate() - diff);
            return resultDate;
        }
    };
    
    let startDate: Date;
    let endDate: Date;

    if (settings.frequency === 'monthly') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const currentMonthStartDate = getMonthlyStartDate(currentYear, currentMonth);
        
        if (today >= currentMonthStartDate) {
            startDate = currentMonthStartDate;
            const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
            const nextMonthStartDate = getMonthlyStartDate(nextMonthDate.getFullYear(), nextMonthDate.getMonth());
            endDate = new Date(nextMonthStartDate.getTime() - 1);
        } else {
            const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
            startDate = getMonthlyStartDate(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
            endDate = new Date(currentMonthStartDate.getTime() - 1);
        }
    } else { // weekly
        const startDayOfWeek = settings.startDay;
        const currentDayOfWeek = today.getDay();
        
        startDate = new Date(today);
        let diff = currentDayOfWeek - startDayOfWeek;
        if (diff < 0) diff += 7;
        startDate.setDate(today.getDate() - diff);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { start: startDate, end: endDate };
};

const getNextDate = (current: Date, frequency: RecurringTransaction['frequency']): Date => {
    const next = new Date(current);
    next.setHours(12, 0, 0, 0); // Avoid timezone issues
    switch (frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', PRELOADED_TRANSACTIONS);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', DEFAULT_ACCOUNTS);
  const [cycleSettings, setCycleSettings] = useLocalStorage<CycleSettings>('cycleSettings', DEFAULT_CYCLE_SETTINGS);
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
  const [chartSettings, setChartSettings] = useLocalStorage<ChartSettings>('chartSettings', DEFAULT_CHART_SETTINGS);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);
  
  // State for the new add transaction flow
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = React.useState(false);
  const [transactionToEditInFlow, setTransactionToEditInFlow] = React.useState<Transaction | null>(null);

  // State for budget modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false);
  const [budgetToEdit, setBudgetToEdit] = React.useState<Budget | null>(null);
  const [budgetCreationCycle, setBudgetCreationCycle] = React.useState<string | null>(null);

  // State for Budget Planning
  const [overallBudgets, setOverallBudgets] = useLocalStorage<OverallBudget[]>('overallBudgets', []);
  
  // Gamification State
  const [playerProfile, setPlayerProfile] = useLocalStorage<PlayerProfile>('playerProfile', { level: 1, xp: 0, unlockedAchievements: [] });
  const [achievementNotification, setAchievementNotification] = React.useState<AchievementNotification>(null);

  React.useEffect(() => {
    const isFirstRun = !window.localStorage.getItem('transactions');
    if (isFirstRun) {
        setTransactions(PRELOADED_TRANSACTIONS);
    }
  }, [setTransactions]);

  const xpForNextLevel = React.useMemo(() => playerProfile.level * 100, [playerProfile.level]);

  const grantXP = React.useCallback((amount: number) => {
    setPlayerProfile(prev => {
        let newXP = prev.xp + amount;
        let newLevel = prev.level;
        let xpToLevelUp = newLevel * 100;

        while (newXP >= xpToLevelUp) {
            newLevel++;
            newXP -= xpToLevelUp;
            xpToLevelUp = newLevel * 100;
        }
        return { ...prev, level: newLevel, xp: newXP };
    });
  }, [setPlayerProfile]);

  const unlockAchievement = React.useCallback((id: string) => {
      if (playerProfile.unlockedAchievements.includes(id)) return;

      const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id);
      if (!achievement) return;

      setPlayerProfile(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, id],
      }));
      grantXP(achievement.xp);
      setAchievementNotification({ id: achievement.id, name: achievement.name, icon: achievement.icon, xp: achievement.xp });
  }, [playerProfile.unlockedAchievements, grantXP, setPlayerProfile]);

  const clearAchievementNotification = React.useCallback(() => {
    setAchievementNotification(null);
  }, []);

  // Effect for generating recurring transactions
  React.useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const newTransactions: Transaction[] = [];
    const updatedRecurring = recurringTransactions.map(rule => {
        if (!rule.isActive) return rule;

        const ruleEndDate = rule.endDate ? new Date(rule.endDate) : null;
        if (ruleEndDate && today > ruleEndDate) return rule;

        const updatedRule = { ...rule };
        let nextDueDate = new Date(rule.lastGeneratedDate || rule.startDate);
        if (rule.lastGeneratedDate) {
            nextDueDate = getNextDate(nextDueDate, rule.frequency);
        }

        while(nextDueDate <= today) {
            if (ruleEndDate && nextDueDate > ruleEndDate) break;
            
            newTransactions.push({
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                description: updatedRule.description,
                amount: updatedRule.amount,
                type: updatedRule.type,
                date: nextDueDate.toISOString().split('T')[0],
                time: '00:00',
                categoryId: updatedRule.categoryId,
                accountId: updatedRule.accountId,
                recurringTransactionId: updatedRule.id,
            });
            updatedRule.lastGeneratedDate = nextDueDate.toISOString().split('T')[0];
            nextDueDate = getNextDate(nextDueDate, updatedRule.frequency);
        }
        return updatedRule;
    });

    if (newTransactions.length > 0) {
        setTransactions(prev => [...prev, ...newTransactions]);
        setRecurringTransactions(updatedRecurring);
    }
  }, [recurringTransactions, setRecurringTransactions, setTransactions]);

  const currentCycle = React.useMemo(() => getCurrentCycleDates(cycleSettings), [cycleSettings]);

  const cycleTransactions = React.useMemo(() => {
    const cycleStartTime = currentCycle.start.getTime();
    const cycleEndTime = currentCycle.end.getTime();

    return transactions.filter(t => {
        const parts = t.date.split('-').map(s => parseInt(s, 10));
        const transactionDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const transactionTime = transactionDate.getTime();
        
        return transactionTime >= cycleStartTime && transactionTime <= cycleEndTime;
    });
  }, [transactions, currentCycle]);

  const categoryAverages = React.useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    
    const relevantTransactions = transactions.filter(t => 
        t.type === TransactionType.EXPENSE && new Date(t.date) >= sixMonthsAgo && t.categoryId
    );

    const monthlySpends: { [categoryId: string]: { [month: string]: number } } = {};
    
    relevantTransactions.forEach(t => {
        const monthKey = t.date.substring(0, 7); // YYYY-MM
        if (!monthlySpends[t.categoryId!]) {
            monthlySpends[t.categoryId!] = {};
        }
        if (!monthlySpends[t.categoryId!][monthKey]) {
            monthlySpends[t.categoryId!][monthKey] = 0;
        }
        monthlySpends[t.categoryId!][monthKey] += t.amount;
    });
    
    const averages = new Map<string, number>();
    for (const categoryId in monthlySpends) {
        const monthlyValues = Object.values(monthlySpends[categoryId]);
        const average = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
        averages.set(categoryId, average);
    }
    
    return averages;
  }, [transactions]);

  const accountDetails = React.useMemo(() => {
    const details = new Map<string, { transactionCount: number; currentBalance: number }>();
    accounts.forEach(account => {
        let transactionCount = 0;
        let currentBalance = account.initialBalance;
        
        transactions.forEach(t => {
            let involved = false;
            // Debit from source account
            if (t.accountId === account.id) {
                involved = true;
                if (t.type === TransactionType.INCOME) {
                    currentBalance += t.amount;
                } else { // EXPENSE or TRANSFER out
                    currentBalance -= t.amount;
                }
            }
            // Credit to destination account (for transfers)
            if (t.type === TransactionType.TRANSFER && t.destinationAccountId === account.id) {
                involved = true;
                currentBalance += t.amount;
            }

            if (involved) {
                transactionCount++;
            }
        });
        details.set(account.id, { transactionCount, currentBalance });
    });
    return details;
  }, [transactions, accounts]);

  const addTransaction = React.useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (transactions.length === 0) unlockAchievement('first_transaction');
    if (transactions.length === 9) unlockAchievement('ten_transactions');
    if (transactions.length === 99) unlockAchievement('centurion');
    
    grantXP(5);
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID(), createdAt: Date.now() }]);
  }, [setTransactions, transactions, unlockAchievement, grantXP]);

  const updateTransaction = React.useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  }, [setTransactions]);
  
  const deleteTransaction = React.useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const addCategory = React.useCallback((category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
  }, [setCategories]);

  const updateCategory = React.useCallback((updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }, [setCategories]);

  const deleteCategory = React.useCallback((id: string) => {
    if (transactions.some(t => t.categoryId === id)) {
        alert("Não é possível eliminar categorias com transações associadas.");
        return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [transactions, setCategories]);

  const addAccount = React.useCallback((account: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...account, id: crypto.randomUUID() }]);
  }, [setAccounts]);

  const updateAccount = React.useCallback((updatedAccount: Account) => {
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  }, [setAccounts]);

  const deleteAccount = React.useCallback((id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    const details = accountDetails.get(id);
    const hasTransactions = details ? details.transactionCount > 0 : false;

    // Case 1: No transactions -> Deletion is allowed regardless of balance.
    if (!hasTransactions) {
      if (window.confirm("Tem a certeza que deseja eliminar permanentemente esta conta? Esta ação não pode ser desfeita.")) {
        setAccounts(prev => prev.filter(a => a.id !== id));
      }
      return;
    }
    
    // Case 2: Has transactions -> Check balance.
    const currentBalance = details ? details.currentBalance : 0;

    // Sub-case 2.1: Non-zero balance -> Block all actions.
    if (Math.abs(currentBalance) > 0.001) {
      alert("Não é possível eliminar ou inativar uma conta com movimentos e saldo diferente de zero.");
      return;
    }

    // Sub-case 2.2: Zero balance -> Allow inactivation/reactivation.
    const actionText = account.isActive ? 'inativar' : 'reativar';
    if (window.confirm(`Esta conta tem movimentos e não pode ser eliminada permanentemente. O saldo atual é zero. Deseja ${actionText} esta conta?`)) {
        updateAccount({ ...account, isActive: !account.isActive });
    }
  }, [accounts, accountDetails, updateAccount, setAccounts]);
  
  const addRecurringTransaction = React.useCallback((recurring: Omit<RecurringTransaction, 'id'>) => {
    if (recurringTransactions.length === 0) unlockAchievement('first_recurring');
    setRecurringTransactions(prev => [...prev, { ...recurring, id: crypto.randomUUID() }]);
  }, [setRecurringTransactions, recurringTransactions.length, unlockAchievement]);
  
  const updateRecurringTransaction = React.useCallback((updatedRecurring: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map(r => r.id === updatedRecurring.id ? updatedRecurring : r));
  }, [setRecurringTransactions]);

  const deleteRecurringTransaction = React.useCallback((id: string) => {
    if (transactions.some(t => t.recurringTransactionId === id)) {
        if(!window.confirm("Esta regra já gerou transações. Deseja mesmo eliminá-la? As transações existentes não serão afetadas.")) return;
    }
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  }, [transactions, setRecurringTransactions]);

  // Budget functions
  const addBudget = React.useCallback((budget: Omit<Budget, 'id'>) => {
      if (budgets.length === 0) unlockAchievement('first_budget');
      setBudgets(prev => [...prev, { ...budget, id: crypto.randomUUID() }]);
  }, [setBudgets, budgets.length, unlockAchievement]);

  const updateBudget = React.useCallback((updatedBudget: Budget) => {
      setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  }, [setBudgets]);

  const deleteBudget = React.useCallback((id: string) => {
      setBudgets(prev => prev.filter(b => b.id !== id));
  }, [setBudgets]);

  const openBudgetModal = React.useCallback((budget?: Budget, cycle?: string) => {
    setBudgetToEdit(budget || null);
    if (!budget && cycle) {
      setBudgetCreationCycle(cycle);
    }
    setIsBudgetModalOpen(true);
  }, []);

  const closeBudgetModal = React.useCallback(() => {
    setIsBudgetModalOpen(false);
    setBudgetToEdit(null);
    setBudgetCreationCycle(null);
  }, []);
  
  const openModal = React.useCallback((transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setIsModalOpen(true);
  }, []);
  
  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  }, []);

  const openAddTransactionModal = React.useCallback(() => {
    setTransactionToEditInFlow(null);
    setIsAddTransactionModalOpen(true);
  }, []);

  const openAddTransactionModalForEdit = React.useCallback((transaction: Transaction) => {
    setTransactionToEditInFlow(transaction);
    setIsAddTransactionModalOpen(true);
  }, []);

  const openTransactionModalForDuplication = React.useCallback((transaction: Transaction) => {
    const duplicatedData = {
        ...transaction,
        id: '', // Signal that this is a new transaction, not an edit
        createdAt: 0,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
    };
    setTransactionToEditInFlow(duplicatedData as Transaction);
    setIsAddTransactionModalOpen(true);
  }, []);

  const closeAddTransactionModal = React.useCallback(() => {
    setIsAddTransactionModalOpen(false);
    setTransactionToEditInFlow(null);
  }, []);

  const updateCycleSettings = React.useCallback((settings: CycleSettings) => {
      setCycleSettings(settings);
  }, [setCycleSettings]);
  
  const updateChartSettings = React.useCallback((settings: ChartSettings) => {
      setChartSettings(settings);
  }, [setChartSettings]);

  const saveOverallBudget = React.useCallback((budget: OverallBudget) => {
    const isFirstPlan = !overallBudgets.some(b => b.cycle === budget.cycle);
    if (isFirstPlan) unlockAchievement('first_plan');
    
    setOverallBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.cycle === budget.cycle);
        if (existingIndex > -1) {
            const newBudgets = [...prev];
            newBudgets[existingIndex] = budget;
            return newBudgets;
        }
        return [...prev, budget];
    });
  }, [setOverallBudgets, overallBudgets, unlockAchievement]);

  const deleteOverallBudget = React.useCallback((cycle: string) => {
      setOverallBudgets(prev => prev.filter(b => b.cycle !== cycle));
  }, [setOverallBudgets]);


  const importData = React.useCallback((data: any): { success: boolean; message: string } => {
    const validationErrors: string[] = [];
    
    if (!data) {
        return { success: false, message: 'Ficheiro de backup inválido ou vazio.' };
    }

    if (!data.transactions || !Array.isArray(data.transactions)) validationErrors.push('Dados de transações em falta ou inválidos.');
    if (!data.categories || !Array.isArray(data.categories)) validationErrors.push('Dados de categorias em falta ou inválidos.');
    if (!data.accounts || !Array.isArray(data.accounts)) validationErrors.push('Dados de contas em falta ou inválidos.');
    if (!data.cycleSettings || typeof data.cycleSettings !== 'object') validationErrors.push('Dados de configuração do ciclo em falta ou inválidos.');
    if (data.recurringTransactions && !Array.isArray(data.recurringTransactions)) validationErrors.push('Dados de transações recorrentes inválidos.');
    if (data.budgets && !Array.isArray(data.budgets)) validationErrors.push('Dados de orçamentos inválidos.');

    if (validationErrors.length > 0) {
        return { success: false, message: 'Ficheiro de backup inválido ou corrompido:\n\n' + validationErrors.join('\n') };
    }
    
    const hasInvalidTransactions = data.transactions.some((t: any) => typeof t.amount !== 'number' || isNaN(t.amount) || !t.id || !t.accountId || !t.date || !t.type);
    if (hasInvalidTransactions) validationErrors.push('Uma ou mais transações têm dados inválidos ou em falta (ex: valor não numérico, ID em falta).');

    const hasInvalidAccounts = data.accounts.some((a: any) => typeof a.initialBalance !== 'number' || isNaN(a.initialBalance) || !a.id || !a.name);
    if (hasInvalidAccounts) validationErrors.push('Uma ou mais contas têm dados inválidos ou em falta (ex: saldo inicial não numérico, nome em falta).');

    if (data.recurringTransactions) {
        const hasInvalidRecurring = data.recurringTransactions.some((r: any) => typeof r.amount !== 'number' || isNaN(r.amount) || !r.id || !r.accountId || !r.startDate || !r.frequency);
        if (hasInvalidRecurring) validationErrors.push('Uma ou mais transações recorrentes têm dados inválidos ou em falta.');
    }
    
    if (data.budgets) {
        const hasInvalidBudgets = data.budgets.some((b: any) => typeof b.amount !== 'number' || isNaN(b.amount) || !b.id || !b.categoryId || !b.cycle);
        if (hasInvalidBudgets) validationErrors.push('Uma ou mais orçamentos têm dados inválidos ou em falta.');
    }

    if (validationErrors.length > 0) {
        return { success: false, message: 'O ficheiro de backup contém dados inválidos:\n\n' + validationErrors.join('\n') };
    }
    
    const transactionsWithTime = data.transactions.map((t: any) => ({ ...t, time: t.time || '00:00' }));
    const accountsWithActive = data.accounts.map((a: any) => ({ ...a, isActive: a.isActive === undefined ? true : a.isActive }));

    setTransactions(transactionsWithTime);
    setCategories(data.categories);
    setAccounts(accountsWithActive);
    setCycleSettings(data.cycleSettings);
    setRecurringTransactions(data.recurringTransactions || []);
    setChartSettings(data.chartSettings || DEFAULT_CHART_SETTINGS);
    setBudgets(data.budgets || []);

    return { success: true, message: 'Dados importados com sucesso! A aplicação será recarregada.' };
  }, [setTransactions, setCategories, setAccounts, setCycleSettings, setRecurringTransactions, setChartSettings, setBudgets]);

  const value = React.useMemo(() => ({
    transactions,
    cycleTransactions,
    categories,
    accounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addAccount,
    updateAccount,
    deleteAccount,
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    isModalOpen,
    openModal,
    closeModal,
    transactionToEdit,
    cycleSettings,
    updateCycleSettings,
    currentCycle,
    importData,
    chartSettings,
    updateChartSettings,
    isAddTransactionModalOpen,
    openAddTransactionModal,
    closeAddTransactionModal,
    transactionToEditInFlow,
    openAddTransactionModalForEdit,
    openTransactionModalForDuplication,
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    isBudgetModalOpen,
    openBudgetModal,
    closeBudgetModal,
    budgetToEdit,
    budgetCreationCycle,
    overallBudgets,
    saveOverallBudget,
    deleteOverallBudget,
    categoryAverages,
    playerProfile,
    xpForNextLevel,
    allAchievements: ALL_ACHIEVEMENTS,
    achievementNotification,
    clearAchievementNotification,
    accountDetails,
  }), [
    transactions, cycleTransactions, categories, accounts, addTransaction, updateTransaction,
    deleteTransaction, addCategory, updateCategory, deleteCategory, addAccount, updateAccount,
    deleteAccount, recurringTransactions, addRecurringTransaction, updateRecurringTransaction,
    deleteRecurringTransaction, isModalOpen, openModal, closeModal, transactionToEdit,
    cycleSettings, updateCycleSettings, currentCycle, importData,
    chartSettings, updateChartSettings, isAddTransactionModalOpen, openAddTransactionModal,
    closeAddTransactionModal, transactionToEditInFlow, openAddTransactionModalForEdit,
    openTransactionModalForDuplication,
    budgets, addBudget, updateBudget, deleteBudget, isBudgetModalOpen, openBudgetModal,
    closeBudgetModal, budgetToEdit, budgetCreationCycle, overallBudgets, saveOverallBudget,
    deleteOverallBudget, categoryAverages, playerProfile, xpForNextLevel, 
    achievementNotification, clearAchievementNotification, accountDetails
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
