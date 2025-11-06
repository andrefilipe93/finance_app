

import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';

const AccountsSummary: React.FC = () => {
    const { accounts, transactions } = useAppContext();

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    };

    const accountBalances = useMemo(() => {
        return accounts
            .filter(a => a.isActive)
            .map(account => {
                let currentBalance = account.initialBalance;
                transactions.forEach(t => {
                    if (t.accountId === account.id) {
                        if (t.type === TransactionType.INCOME) {
                            currentBalance += t.amount;
                        } else {
                            currentBalance -= t.amount;
                        }
                    }
                    if (t.type === TransactionType.TRANSFER && t.destinationAccountId === account.id) {
                        currentBalance += t.amount;
                    }
                });
                return { ...account, currentBalance };
            })
            .sort((a,b) => b.currentBalance - a.currentBalance);
    }, [accounts, transactions]);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Minhas Contas</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                {accountBalances.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {accountBalances.map(account => (
                            <li key={account.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-2xl w-8 h-8 flex items-center justify-center">{account.icon}</div>
                                    <p className="font-semibold">{account.name}</p>
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {formatCurrency(account.currentBalance)}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">Nenhuma conta ativa.</p>
                )}
            </div>
        </div>
    );
};

export default AccountsSummary;
