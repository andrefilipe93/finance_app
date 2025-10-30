import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import TransactionDetailModal from '../TransactionDetailModal';

const HistoryView: React.FC = () => {
  const { transactions, categories, accounts } = useAppContext();
  const [selectedTransaction, setSelectedTransaction] = useState<(Transaction & { runningBalance: number }) | null>(null);


  const groupedTransactions = useMemo(() => {
    const totalInitialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);

    const chronologicalTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Compare dates first
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
        }
        
        // If dates are the same, compare by creation time
        return a.createdAt - b.createdAt;
    });

    let runningBalance = totalInitialBalance;
    const transactionsWithBalance = chronologicalTransactions.map(t => {
        if (t.type !== TransactionType.TRANSFER) {
            runningBalance += t.type === TransactionType.INCOME ? t.amount : -t.amount;
        }
        return { ...t, runningBalance };
    });

    const displayTransactions = transactionsWithBalance.reverse();

    return displayTransactions.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(t);
      return acc;
    }, {} as Record<string, (Transaction & { runningBalance: number })[]>);
  }, [transactions, accounts]);

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
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
                    const account = accounts.find(a => a.id === t.accountId);
                    const destinationAccount = accounts.find(a => a.id === t.destinationAccountId);
                    const isExpense = t.type === TransactionType.EXPENSE;
                    const isTransfer = t.type === TransactionType.TRANSFER;
                    return (
                      <li 
                        key={t.id} 
                        onClick={() => setSelectedTransaction(t)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-4 flex-grow min-w-[200px]">
                          <div className="text-2xl">{isTransfer ? '🔄' : category?.icon || '💸'}</div>
                          <div>
                            <p className="font-semibold">{t.description}</p>
                            {isTransfer ? (
                               <p className="text-sm text-gray-500 dark:text-gray-400">{account?.name} → {destinationAccount?.name}</p>
                            ) : (
                               <p className="text-sm text-gray-500 dark:text-gray-400">{category?.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
                          <div className="text-right w-28">
                              <p className={`font-bold ${isExpense ? 'text-red-500' : isTransfer ? 'text-gray-700 dark:text-gray-200' : 'text-green-500'}`}>
                              {isExpense ? '-' : isTransfer ? '' : '+'} {t.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </p>
                              {!isTransfer && <p className="text-sm text-gray-500 dark:text-gray-400">{account?.name}</p>}
                          </div>
                           <div className="text-right w-28">
                              <p className="font-semibold text-gray-700 dark:text-gray-200">{t.runningBalance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Saldo Após</p>
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
      <TransactionDetailModal transaction={selectedTransaction} onClose={handleCloseModal} />
    </>
  );
};

export default HistoryView;