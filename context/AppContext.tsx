
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_CYCLE_SETTINGS } from '../constants';
import type { Transaction, Category, Account, CycleSettings, RecurringTransaction } from '../types';
import { TransactionType } from '../types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', DEFAULT_ACCOUNTS);
  const [cycleSettings, setCycleSettings] = useLocalStorage<CycleSettings>('cycleSettings', DEFAULT_CYCLE_SETTINGS);
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  
  useEffect(() => {
    const needsMigration = transactions.some(t => !t.createdAt);

    if (needsMigration) {
        const migrated = transactions.map(t => {
            if (t.createdAt) return t;
            const fallbackTimestamp = parseInt(t.id, 10);
            return {
                ...t,
                createdAt: !isNaN(fallbackTimestamp) ? fallbackTimestamp : new Date(t.date).getTime(),
            };
        });
        setTransactions(migrated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for generating recurring transactions
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCycle = useMemo(() => getCurrentCycleDates(cycleSettings), [cycleSettings]);

  const cycleTransactions = useMemo(() => {
      return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          const transactionTimestamp = new Date(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth(), transactionDate.getUTCDate()).getTime();
          const cycleStartTimestamp = new Date(currentCycle.start.getFullYear(), currentCycle.start.getMonth(), currentCycle.start.getDate()).getTime();
          const cycleEndTimestamp = new Date(currentCycle.end.getFullYear(), currentCycle.end.getMonth(), currentCycle.end.getDate()).getTime();
          
          return transactionTimestamp >= cycleStartTimestamp && transactionTimestamp <= cycleEndTimestamp;
      });
  }, [transactions, currentCycle]);


  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: crypto.randomUUID() }]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };

  const deleteCategory = (id: string) => {
    if (transactions.some(t => t.categoryId === id)) {
        alert("Não é possível excluir categorias com transações associadas.");
        return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    setAccounts(prev => [...prev, { ...account, id: crypto.randomUUID() }]);
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  const deleteAccount = (id: string) => {
    if (transactions.some(t => t.accountId === id)) {
        alert("Não é possível excluir contas com transações associadas.");
        return;
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
  };
  
  const addRecurringTransaction = (recurring: Omit<RecurringTransaction, 'id'>) => {
    setRecurringTransactions(prev => [...prev, { ...recurring, id: crypto.randomUUID() }]);
  };
  
  const updateRecurringTransaction = (updatedRecurring: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map(r => r.id === updatedRecurring.id ? updatedRecurring : r));
  };

  const deleteRecurringTransaction = (id: string) => {
    if (transactions.some(t => t.recurringTransactionId === id)) {
        if(!window.confirm("Esta regra já gerou transações. Deseja mesmo eliminá-la? As transações existentes não serão afetadas.")) return;
    }
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };
  
  const openModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  };

  const updateCycleSettings = (settings: CycleSettings) => {
      setCycleSettings(settings);
  };

  const value = {
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
    currentCycle
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};