import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import { PencilIcon, TrashIcon } from '../icons';

const HistoryView: React.FC = () => {
  const { transactions, categories, accounts, deleteTransaction, openModal } = useAppContext();

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // FIX: The initial value of reduce was an untype empty object `{}`, causing TypeScript to infer the accumulator's type incorrectly. By casting the initial value to `Record<string, Transaction[]>`, we ensure that `groupedTransactions` has the correct type, which in turn correctly types `transactionsInDate` as `Transaction[]`, resolving the error on `.map`.
    return sorted.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Histórico de Transações</h1>
      {Object.keys(groupedTransactions).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, transactionsInDate]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">{date}</h2>
              <ul className="space-y-3">
                {transactionsInDate.map(t => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const isExpense = t.type === TransactionType.EXPENSE;
                  return (
                    <li key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{category?.icon || '💸'}</div>
                        <div>
                          <p className="font-semibold">{t.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{category?.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-4">
                        <div>
                            <p className={`font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                            {isExpense ? '-' : '+'} {t.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{accounts.find(a => a.id === t.accountId)?.name}</p>
                        </div>
                        <div className="flex space-x-2">
                           <button onClick={() => openModal(t)} className="p-2 text-gray-400 hover:text-blue-500 transition"><PencilIcon className="w-5 h-5"/></button>
                           <button onClick={() => deleteTransaction(t.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhuma transação encontrada.</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Clique no botão '+' para adicionar uma nova transação.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;