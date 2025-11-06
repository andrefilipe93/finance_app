import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType, Budget, Transaction } from '../../types';
import { PencilIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface BudgetProgressCardProps {
  budget: Budget;
  transactionsForPeriod: Transaction[];
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
};

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({ budget, transactionsForPeriod }) => {
    const { categories, openBudgetModal } = useAppContext();
    
    const category = useMemo(() => categories.find(c => c.id === budget.categoryId), [categories, budget.categoryId]);

    const spentAmount = useMemo(() => {
        return transactionsForPeriod
            .filter(t => t.type === TransactionType.EXPENSE && t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactionsForPeriod, budget.categoryId]);

    if (!category) return null;

    const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    const isOverBudget = progress > 100;
    
    let progressBarColor = 'bg-green-500';
    if (progress > 90) progressBarColor = 'bg-red-500';
    else if (progress > 75) progressBarColor = 'bg-yellow-500';
    
    const remainingAmount = budget.amount - spentAmount;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Orçamento: {formatCurrency(budget.amount)}
                        </p>
                    </div>
                </div>
                 <button 
                    onClick={() => openBudgetModal(budget)} 
                    className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={`Editar orçamento para ${category.name}`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div>
                <div className="flex justify-between text-sm mb-1 font-medium text-gray-600 dark:text-gray-300">
                    <span>Gasto: {formatCurrency(spentAmount)}</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${progressBarColor}`} 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                 <div className="text-right text-sm mt-1">
                    {isOverBudget ? (
                        <p className="font-semibold text-red-500">
                            {formatCurrency(Math.abs(remainingAmount))} acima
                        </p>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400">
                            Resta: {formatCurrency(remainingAmount)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};


const BudgetsView: React.FC = () => {
    const { budgets, transactions, openBudgetModal } = useAppContext();
    const [displayDate, setDisplayDate] = useState(new Date());

    const handlePrev = () => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 15));
    };
    const handleNext = () => {
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 15));
    };

    const displayPeriodLabel = useMemo(() => {
        return displayDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }, [displayDate]);

    const displayCycleString = useMemo(() => {
        return `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    }, [displayDate]);

    const displayBudgets = useMemo(() => {
        return budgets.filter(b => b.cycle === displayCycleString);
    }, [budgets, displayCycleString]);

    const transactionsForPeriod = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
    }, [transactions, displayDate]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Orçamentos</h1>
                 <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Mês anterior">
                            <ChevronLeftIcon className="w-6 h-6"/>
                        </button>
                        <p className="text-center font-semibold text-lg text-blue-500 w-48 capitalize" aria-live="polite">
                            {displayPeriodLabel}
                        </p>
                        <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Próximo mês">
                            <ChevronRightIcon className="w-6 h-6"/>
                        </button>
                    </div>
                     <button
                        onClick={() => openBudgetModal(undefined, displayCycleString)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow"
                     >
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Novo Orçamento</span>
                     </button>
                 </div>
            </div>
            
            {displayBudgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayBudgets.map(budget => (
                        <BudgetProgressCard key={budget.id} budget={budget} transactionsForPeriod={transactionsForPeriod} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhum orçamento definido para {displayPeriodLabel}.</h2>
                    <p className="text-gray-400 dark:text-gray-500 mt-2">Crie um orçamento para começar a planear os seus gastos neste período!</p>
                </div>
            )}
        </div>
    );
};

export default BudgetsView;
