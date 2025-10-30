
import React, { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from '../constants';
import type { Transaction, Category, Account } from '../types';
import { TransactionType } from '../types';

interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  isModalOpen: boolean;
  openModal: (transaction?: Transaction) => void;
  closeModal: () => void;
  transactionToEdit: Transaction | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', DEFAULT_ACCOUNTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now().toString() }]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
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
    setAccounts(prev => [...prev, { ...account, id: Date.now().toString() }]);
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
  
  const openModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  };

  const value = {
    transactions,
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
    isModalOpen,
    openModal,
    closeModal,
    transactionToEdit,
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