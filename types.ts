import { Achievement } from './achievements';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  time: string;
  categoryId?: string;
  accountId: string;
  destinationAccountId?: string;
  createdAt: number;
  recurringTransactionId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Account {
  id:string;
  name: string;
  initialBalance: number;
  type: string;
  startDate: string;
  icon: string;
  isActive: boolean;
}

export type MonthlyStartType = 'fixed' | 'first_weekday' | 'last_weekday';

export interface CycleSettings {
  frequency: 'monthly' | 'weekly';
  startDay: number; // For weekly (0-6), monthly-fixed (1-28), or monthly-weekday (0-6)
  monthlyStartType?: MonthlyStartType; // Only for monthly frequency
}

export interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType.INCOME | TransactionType.EXPENSE;
    accountId: string;
    categoryId: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
    isVariable: boolean;
    isActive: boolean;
    lastGeneratedDate?: string;
}

export interface ChartSettings {
  expensesByCategory: boolean;
  incomeByCategory: boolean;
  expenseEvolution: boolean;
  dailyMovements: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  cycle: string; // "YYYY-MM" format
}

export interface OverallBudget {
    cycle: string; // "YYYY-MM" format
    amount: number;
}

export interface PlayerProfile {
  level: number;
  xp: number;
  unlockedAchievements: string[];
}

export type AchievementNotification = Omit<Achievement, 'description'> | null;


export type View = 'home' | 'charts' | 'history' | 'settings' | 'budgets' | 'budget-planning' | 'progress';