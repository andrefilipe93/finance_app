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
  const { transactions, accounts } = useAppContext();

  const { totalBalance, totalIncome, totalExpense } = useMemo(() => {
    const initialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);

    const transactionTotals = transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpense += t.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
    
    const totalBalance = initialBalance + transactionTotals.totalIncome - transactionTotals.totalExpense;

    return { 
      totalBalance, 
      totalIncome: transactionTotals.totalIncome, 
      totalExpense: transactionTotals.totalExpense 
    };
  }, [transactions, accounts]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo Total" amount={totalBalance} color={totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'} />
        <StatCard title="Receitas Totais" amount={totalIncome} color="text-green-500" />
        <StatCard title="Despesas Totais" amount={totalExpense} color="text-red-500" />
      </div>

      {transactions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
            <div className="h-80">
              <CategoryPieChart />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Receitas vs Despesas (Últimos 6 meses)</h2>
             <div className="h-80">
              <IncomeExpenseBarChart />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhuma transação encontrada.</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Adicione sua primeira transação para ver os gráficos!</p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;