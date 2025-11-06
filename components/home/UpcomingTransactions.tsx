

import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType, View } from '../../types';

interface RecentTransactionsProps {
    setActiveView: (view: View) => void;
}

const formatRelativeDate = (dateString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactionDateUTC = new Date(dateString);
    const transactionDate = new Date(transactionDateUTC.getUTCFullYear(), transactionDateUTC.getUTCMonth(), transactionDateUTC.getUTCDate());
    transactionDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - transactionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays > 1 && diffDays <= 7) return `Há ${diffDays} dias`;
    
    return transactionDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
};


const RecentTransactions: React.FC<RecentTransactionsProps> = ({ setActiveView }) => {
  const { transactions, categories } = useAppContext();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  };

  const recentTransactions = useMemo(() => {
    const now = new Date();

    return transactions
      .filter(t => new Date(`${t.date}T${t.time || '00:00'}`) <= now)
      .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
          const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
          return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [transactions]);

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Últimos Movimentos</h2>
            <button onClick={() => setActiveView('history')} className="text-blue-500 font-semibold hover:underline">
                Ver todos
            </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
            {recentTransactions.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTransactions.map(t => {
                        const category = categories.find(c => c.id === t.categoryId);
                        const isExpense = t.type === TransactionType.EXPENSE;
                        const isTransfer = t.type === TransactionType.TRANSFER;
                        return (
                            <li key={t.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl w-8 h-8 flex items-center justify-center">{isTransfer ? '🔄' : category?.icon || '💸'}</div>
                                    <div>
                                        <p className="font-semibold">{t.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatRelativeDate(t.date)}
                                        </p>
                                    </div>
                                </div>
                                <p className={`font-semibold ${isExpense ? 'text-red-500' : isTransfer ? 'text-gray-700 dark:text-gray-200' : 'text-green-500'}`}>
                                    {isExpense ? '-' : isTransfer ? '' : '+'}{formatCurrency(t.amount)}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">Nenhum movimento recente.</p>
            )}
        </div>
    </div>
  );
};

export default RecentTransactions;
