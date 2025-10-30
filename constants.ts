import { Category, Account } from './types';
import { TransactionType } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Alimentação', icon: '🍔', color: '#ff6384', type: TransactionType.EXPENSE },
  { id: 'cat2', name: 'Transporte', icon: '🚗', color: '#36a2eb', type: TransactionType.EXPENSE },
  { id: 'cat3', name: 'Moradia', icon: '🏠', color: '#ffce56', type: TransactionType.EXPENSE },
  { id: 'cat4', name: 'Lazer', icon: '🎬', color: '#4bc0c0', type: TransactionType.EXPENSE },
  { id: 'cat5', name: 'Saúde', icon: '❤️', color: '#9966ff', type: TransactionType.EXPENSE },
  { id: 'cat6', name: 'Salário', icon: '💰', color: '#32cd32', type: TransactionType.INCOME },
  { id: 'cat7', name: 'Outros', icon: '📦', color: '#c9cbcf', type: TransactionType.EXPENSE },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Carteira', initialBalance: 0, type: 'Carteira', startDate: new Date().toISOString().split('T')[0] },
  { id: 'acc2', name: 'Conta Bancária', initialBalance: 1000, type: 'Conta Corrente', startDate: new Date().toISOString().split('T')[0] },
];