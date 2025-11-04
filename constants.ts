import { Category, Account, CycleSettings, ChartSettings } from './types';
import { TransactionType } from './types';

// Sample categories for testing
export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'cat-exp-1', name: 'Supermercado', icon: '🛒', color: '#ff6384', type: TransactionType.EXPENSE },
  { id: 'cat-exp-2', name: 'Restaurantes', icon: '🍔', color: '#ff9f40', type: TransactionType.EXPENSE },
  { id: 'cat-exp-3', name: 'Transportes', icon: '🚗', color: '#ffce56', type: TransactionType.EXPENSE },
  { id: 'cat-exp-4', name: 'Contas de Casa', icon: '💡', color: '#4bc0c0', type: TransactionType.EXPENSE },
  { id: 'cat-exp-5', name: 'Lazer & Cultura', icon: '🎬', color: '#9966ff', type: TransactionType.EXPENSE },
  { id: 'cat-exp-6', name: 'Saúde & Bem-estar', icon: '❤️', color: '#c9cbcf', type: TransactionType.EXPENSE },
  { id: 'cat-exp-7', name: 'Compras', icon: '🛍️', color: '#36a2eb', type: TransactionType.EXPENSE },
  { id: 'cat-exp-8', name: 'Educação', icon: '📚', color: '#e57373', type: TransactionType.EXPENSE },
  { id: 'cat-exp-9', name: 'Viagens', icon: '✈️', color: '#795548', type: TransactionType.EXPENSE },
  { id: 'cat-exp-10', name: 'Impostos', icon: '🧾', color: '#607d8b', type: TransactionType.EXPENSE },
  { id: 'cat-exp-11', name: 'Outras Despesas', icon: '📦', color: '#b0bec5', type: TransactionType.EXPENSE },
  // Incomes
  { id: 'cat-inc-1', name: 'Salário', icon: '💰', color: '#81c784', type: TransactionType.INCOME },
  { id: 'cat-inc-2', name: 'Rendimentos Extra', icon: '💼', color: '#a5d6a7', type: TransactionType.INCOME },
  { id: 'cat-inc-3', name: 'Vendas', icon: '📈', color: '#66bb6a', type: TransactionType.INCOME },
  { id: 'cat-inc-4', name: 'Presentes', icon: '🎁', color: '#ffd54f', type: TransactionType.INCOME },
  { id: 'cat-inc-5', name: 'Reembolsos', icon: '🔙', color: '#ffee58', type: TransactionType.INCOME },
  { id: 'cat-inc-6', name: 'Outras Receitas', icon: '💸', color: '#dce775', type: TransactionType.INCOME },
];


export const ACCOUNT_ICON_MAP: { [key: string]: string } = {
  'Carteira': '👛',
  'Conta Corrente': '🏦',
  'Poupança': '🐷',
  'Investimentos': '📈',
  'Cartão de Crédito': '💳',
  'Conta Digital': '📱',
  'Outro': '💰',
};

// Sample accounts for testing
export const DEFAULT_ACCOUNTS: Account[] = [
    { id: 'acc-1', name: 'Conta à Ordem (BCP)', initialBalance: 1250.75, type: 'Conta Corrente', startDate: '2024-01-01', icon: ACCOUNT_ICON_MAP['Conta Corrente'], isActive: true },
    { id: 'acc-2', name: 'Cartão de Crédito (Wizink)', initialBalance: 0, type: 'Cartão de Crédito', startDate: '2024-01-01', icon: ACCOUNT_ICON_MAP['Cartão de Crédito'], isActive: true },
    { id: 'acc-3', name: 'Conta Poupança', initialBalance: 8500.00, type: 'Poupança', startDate: '2024-01-01', icon: ACCOUNT_ICON_MAP['Poupança'], isActive: true },
    { id: 'acc-4', name: 'Carteira (Físico)', initialBalance: 85.50, type: 'Carteira', startDate: '2024-01-01', icon: ACCOUNT_ICON_MAP['Carteira'], isActive: true },
    { id: 'acc-5', name: 'Revolut', initialBalance: 200.00, type: 'Conta Digital', startDate: '2024-01-01', icon: ACCOUNT_ICON_MAP['Conta Digital'], isActive: true },
];

export const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  frequency: 'monthly',
  monthlyStartType: 'fixed',
  startDay: 1,
};

export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  expensesByCategory: true,
  incomeByCategory: true,
  expenseEvolution: true,
  dailyMovements: true,
};