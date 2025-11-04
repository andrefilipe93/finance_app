import { Transaction, TransactionType } from './types';

// Helper to generate dates relative to today
const d = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Get the first day of the current month
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const firstDayOfMonthString = firstDayOfMonth.toISOString().split('T')[0];

// Get a date from the previous month for historical data
const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
const lastMonthString = (day: number) => new Date(firstDayOfLastMonth.getFullYear(), firstDayOfLastMonth.getMonth(), day).toISOString().split('T')[0];


export const PRELOADED_TRANSACTIONS: Transaction[] = [
  // --- MÊS ANTERIOR (para média do Financial Health) ---
  {
    id: 'txn-hist-1', date: lastMonthString(1), time: '09:00', description: 'Salário (Mês Passado)',
    amount: 1850.00, type: TransactionType.INCOME, accountId: 'acc-1', categoryId: 'cat-inc-1', createdAt: Date.now() - 30 * 86400000
  },
   {
    id: 'txn-hist-2', date: lastMonthString(2), time: '10:00', description: 'Renda (Mês Passado)',
    amount: 750.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-4', createdAt: Date.now() - 29 * 86400000
  },
  {
    id: 'txn-hist-3', date: lastMonthString(5), time: '19:00', description: 'Supermercado (Mês Passado)',
    amount: 150.20, type: TransactionType.EXPENSE, accountId: 'acc-2', categoryId: 'cat-exp-1', createdAt: Date.now() - 26 * 86400000
  },
   {
    id: 'txn-hist-4', date: lastMonthString(15), time: '20:00', description: 'Jantar fora (Mês Passado)',
    amount: 60.00, type: TransactionType.EXPENSE, accountId: 'acc-5', categoryId: 'cat-exp-2', createdAt: Date.now() - 16 * 86400000
  },
  {
    id: 'txn-hist-5', date: lastMonthString(18), time: '12:00', description: 'Combustível (Mês Passado)',
    amount: 70.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-3', createdAt: Date.now() - 13 * 86400000
  },


  // --- CICLO ATUAL (ESTE MÊS) ---
  {
    id: 'txn-curr-01', date: firstDayOfMonthString, time: '09:05', description: 'Salário',
    amount: 1900.00, type: TransactionType.INCOME, accountId: 'acc-1', categoryId: 'cat-inc-1', createdAt: Date.now() - 24 * 86400000
  },
  {
    id: 'txn-curr-02', date: firstDayOfMonthString, time: '11:00', description: 'Renda da casa',
    amount: 750.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-4', createdAt: Date.now() - 24 * 86400000
  },
  {
    id: 'txn-curr-03', date: d(22), time: '19:30', description: 'Compras Continente',
    amount: 120.50, type: TransactionType.EXPENSE, accountId: 'acc-2', categoryId: 'cat-exp-1', createdAt: Date.now() - 22 * 86400000
  },
  {
    id: 'txn-curr-04', date: d(20), time: '08:00', description: 'Transferência para Poupança',
    amount: 250.00, type: TransactionType.TRANSFER, accountId: 'acc-1', destinationAccountId: 'acc-3', createdAt: Date.now() - 20 * 86400000
  },
  {
    id: 'txn-curr-05', date: d(18), time: '20:30', description: 'Jantar com amigos',
    amount: 45.00, type: TransactionType.EXPENSE, accountId: 'acc-5', categoryId: 'cat-exp-2', createdAt: Date.now() - 18 * 86400000
  },
  {
    id: 'txn-curr-06', date: d(17), time: '07:45', description: 'Passe Navegante',
    amount: 40.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-3', createdAt: Date.now() - 17 * 86400000
  },
  {
    id: 'txn-curr-07', date: d(15), time: '18:00', description: 'Fatura Eletricidade (EDP)',
    amount: 52.30, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-4', createdAt: Date.now() - 15 * 86400000
  },
  {
    id: 'txn-curr-08', date: d(13), time: '11:00', description: 'Compras online (Amazon)',
    amount: 78.99, type: TransactionType.EXPENSE, accountId: 'acc-2', categoryId: 'cat-exp-7', createdAt: Date.now() - 13 * 86400000
  },
  {
    id: 'txn-curr-09', date: d(11), time: '22:00', description: 'Bilhetes para o cinema',
    amount: 16.00, type: TransactionType.EXPENSE, accountId: 'acc-5', categoryId: 'cat-exp-5', createdAt: Date.now() - 11 * 86400000
  },
  {
    id: 'txn-curr-10', date: d(9), time: '12:00', description: 'Combustível',
    amount: 65.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-3', createdAt: Date.now() - 9 * 86400000
  },
  {
    id: 'txn-curr-11', date: d(5), time: '18:00', description: 'Mensalidade Ginásio',
    amount: 35.00, type: TransactionType.EXPENSE, accountId: 'acc-1', categoryId: 'cat-exp-6', createdAt: Date.now() - 5 * 86400000
  },
   {
    id: 'txn-curr-12', date: d(3), time: '13:00', description: 'Almoço no trabalho',
    amount: 9.50, type: TransactionType.EXPENSE, accountId: 'acc-4', categoryId: 'cat-exp-2', createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'txn-curr-13', date: d(1), time: '10:00', description: 'Café da manhã',
    amount: 2.80, type: TransactionType.EXPENSE, accountId: 'acc-4', categoryId: 'cat-exp-2', createdAt: Date.now() - 1 * 86400000
  },
];
