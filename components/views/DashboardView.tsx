import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';
import CategoryPieChart from '../charts/CategoryPieChart';
import IncomeExpenseBarChart from '../charts/IncomeExpenseBarChart';

const StatCard: React.FC<{ title: string; amount: number; color: string }> = ({ title, amount, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
    <h3 className="text-lg text-gray-500 dark:text-gray-400">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
  </div>
);

const DashboardView: React.FC = () => {
  const { transactions, accounts, cycleTransactions, currentCycle } = useAppContext();

  const { totalBalance, cycleIncome, cycleExpense } = useMemo(() => {
    const initialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);

    const transactionTotals = transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.totalIncome += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          acc.totalExpense += t.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    const cycleTotals = cycleTransactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.cycleIncome += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          acc.cycleExpense += t.amount;
        }
        return acc;
      },
      { cycleIncome: 0, cycleExpense: 0 }
    );
    
    const totalBalance = initialBalance + transactionTotals.totalIncome - transactionTotals.totalExpense;

    return { 
      totalBalance, 
      cycleIncome: cycleTotals.cycleIncome, 
      cycleExpense: cycleTotals.cycleExpense 
    };
  }, [transactions, accounts, cycleTransactions]);

  const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          A exibir dados de <span className="font-semibold text-blue-500">{formatDate(currentCycle.start)}</span> a <span className="font-semibold text-blue-500">{formatDate(currentCycle.end)}</span>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo Total" amount={totalBalance} color={totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'} />
        <StatCard title="Receitas no Ciclo" amount={cycleIncome} color="text-green-500" />
        <StatCard title="Despesas no Ciclo" amount={cycleExpense} color="text-red-500" />
      </div>

      {cycleTransactions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Despesas do Ciclo por Categoria</h2>
            <div className="h-80">
              <CategoryPieChart />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Movimentos do Ciclo</h2>
             <div className="h-80">
              <IncomeExpenseBarChart />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhuma transação neste ciclo.</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Adicione transações para ver os gráficos!</p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;