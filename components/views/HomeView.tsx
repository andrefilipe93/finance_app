

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType, View } from '../../types';
import AccountsSummary from '../home/AccountsSummary';
import RecentTransactions from '../home/UpcomingTransactions';
import FinancialHealthInsights from '../home/FinancialHealthInsights';
import { EyeIcon, EyeOffIcon } from '../icons';

interface HomeViewProps {
    setActiveView: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setActiveView }) => {
  const { transactions, accounts, cycleTransactions } = useAppContext();
  const [isMasked, setIsMasked] = useState(true);

  useEffect(() => {
    const shouldHide = localStorage.getItem('hideValuesOnStartup') === 'true';
    setIsMasked(shouldHide);
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  };

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


  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center space-x-4">
        <img 
            src="https://source.unsplash.com/random/100x100/?portrait,man" 
            alt="Foto de perfil de André Almeida"
            className="w-16 h-16 rounded-full object-cover shadow-md"
        />
        <div className="flex-grow">
            <h1 className="text-3xl font-bold">Bem-vindo, André Almeida</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Aqui está um resumo das suas finanças.</p>
        </div>
         <button 
            onClick={() => setIsMasked(prev => !prev)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            aria-label={isMasked ? 'Mostrar valores' : 'Ocultar valores'}
        >
            {isMasked ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-800 to-gray-900 text-white p-6 rounded-2xl shadow-lg">
        <p className="text-sm text-slate-300 opacity-90">SALDO GLOBAL</p>
        <p className="text-4xl font-bold mt-1">
            {isMasked ? '€ ••••,••' : formatCurrency(totalBalance)}
        </p>
        <div className="mt-6 flex justify-between border-t border-slate-700 pt-4">
            <div>
                <p className="text-xs text-slate-300 opacity-90">ENTRADAS (CICLO)</p>
                <p className="font-semibold text-lg text-green-400">
                    + {isMasked ? '€ ••••,••' : formatCurrency(cycleIncome)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-300 opacity-90">SAÍDAS (CICLO)</p>
                <p className="font-semibold text-lg text-red-400">
                    - {isMasked ? '€ ••••,••' : formatCurrency(cycleExpense)}
                </p>
            </div>
        </div>
      </div>

      {/* Financial Health Insights */}
      <FinancialHealthInsights />

      {/* Accounts Summary and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AccountsSummary />
        <RecentTransactions setActiveView={setActiveView} />
      </div>

    </div>
  );
};

export default HomeView;
