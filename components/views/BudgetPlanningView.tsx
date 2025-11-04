import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

const StatCard: React.FC<{ title: string; value: string; color?: string }> = ({ title, value, color = 'text-gray-800 dark:text-gray-200' }) => (
  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
    <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);


interface PlannerProps {
    displayCycleString: string;
}

const CategoryBudgetPlanner: React.FC<PlannerProps> = ({ displayCycleString }) => {
    const { categories, budgets, categoryAverages, addBudget, updateBudget, transactions } = useAppContext();
    const [budgetValues, setBudgetValues] = useState<Record<string, string>>({});
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const initialValues: Record<string, string> = {};
        const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
        
        expenseCategories.forEach(cat => {
            const existingBudget = budgets.find(b => b.categoryId === cat.id && b.cycle === displayCycleString);
            initialValues[cat.id] = existingBudget ? String(existingBudget.amount).replace('.', ',') : '';
        });
        setBudgetValues(initialValues);
    }, [categories, budgets, displayCycleString]);

    const spentAmounts = useMemo(() => {
        const spends = new Map<string, number>();
        const [year, month] = displayCycleString.split('-').map(Number);
        transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === TransactionType.EXPENSE && t.categoryId && tDate.getFullYear() === year && tDate.getMonth() === month - 1;
            })
            .forEach(t => {
                spends.set(t.categoryId!, (spends.get(t.categoryId!) || 0) + t.amount);
            });
        return spends;
    }, [transactions, displayCycleString]);


    const handleValueChange = (categoryId: string, value: string) => {
        setBudgetValues(prev => ({...prev, [categoryId]: value}));
    };

    const handleSave = () => {
        // FIX: Explicitly type the destructured array from Object.entries to resolve type inference issue with amountStr.
        Object.entries(budgetValues).forEach(([categoryId, amountStr]: [string, string]) => {
            const amount = parseFloat(amountStr.replace(',', '.'));
            
            if (!isNaN(amount) && amount > 0) {
                const existingBudget = budgets.find(b => b.categoryId === categoryId && b.cycle === displayCycleString);
                
                if (existingBudget) {
                    if (existingBudget.amount !== amount) {
                        updateBudget({ ...existingBudget, amount });
                    }
                } else {
                    addBudget({ categoryId, amount, cycle: displayCycleString });
                }
            }
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);

    return (
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
                Defina um limite de gastos para cada categoria. A média de gastos dos últimos 6 meses é apresentada para o ajudar a definir metas realistas.
            </p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {expenseCategories.map(category => {
                    const average = categoryAverages.get(category.id);
                    const plannedAmount = parseFloat(budgetValues[category.id]?.replace(',', '.')) || 0;
                    const spent = spentAmounts.get(category.id) || 0;
                    const difference = plannedAmount - spent;
                    
                    const progress = plannedAmount > 0 ? (spent / plannedAmount) * 100 : 0;
                    let progressBarColor = 'bg-green-500';
                    if (progress > 90) progressBarColor = 'bg-red-500';
                    else if (progress > 75) progressBarColor = 'bg-yellow-500';

                    return (
                        <div key={category.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                           <div className="flex items-center gap-3">
                                <span className="text-2xl">{category.icon}</span>
                                <div>
                                    <p className="font-semibold">{category.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Média: {average ? average.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'}) : 'N/D'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Planeado</label>
                                     <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">€</span></div>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={budgetValues[category.id] || ''}
                                            onChange={e => handleValueChange(category.id, e.target.value)}
                                            placeholder="0,00"
                                            className="block w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-7 text-sm p-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-gray-800 p-2 rounded-md">
                                    <div>
                                         <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Gasto</label>
                                         <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
                                            {spent.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'})}
                                         </p>
                                    </div>
                                     <div>
                                         <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Diferença</label>
                                          <p className={`font-semibold text-sm truncate ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {difference.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'})}
                                         </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium text-gray-500 dark:text-gray-400">
                                    <span>Progresso</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${progressBarColor}`} 
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ease-in-out ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isSaved ? 'Guardado!' : 'Guardar Orçamentos'}
                </button>
            </div>
        </div>
    );
};

const OverallBudgetPlanner: React.FC<PlannerProps> = ({ displayCycleString }) => {
    const { overallBudgets, saveOverallBudget, deleteOverallBudget, transactions } = useAppContext();
    const [amount, setAmount] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    
    useEffect(() => {
        const budgetForCycle = overallBudgets.find(b => b.cycle === displayCycleString);
        if (budgetForCycle) {
            setAmount(String(budgetForCycle.amount).replace('.', ','));
        } else {
            setAmount('');
        }
    }, [overallBudgets, displayCycleString]);

    const spentAmount = useMemo(() => {
        const [year, month] = displayCycleString.split('-').map(Number);
        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === TransactionType.EXPENSE && tDate.getFullYear() === year && tDate.getMonth() === month - 1;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions, displayCycleString]);


    const handleSave = () => {
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            deleteOverallBudget(displayCycleString);
        } else {
            saveOverallBudget({ cycle: displayCycleString, amount: parsedAmount });
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const plannedAmount = parseFloat(amount.replace(',', '.')) || 0;
    const difference = plannedAmount - spentAmount;
    
    const progress = plannedAmount > 0 ? (spentAmount / plannedAmount) * 100 : 0;
    const isOverBudget = progress > 100;
    let progressBarColor = 'bg-green-500';
    if (progress > 90) progressBarColor = 'bg-red-500';
    else if (progress > 75) progressBarColor = 'bg-yellow-500';


    return (
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
                Defina um limite de gastos global para todas as suas despesas no mês selecionado. Deixe em branco ou com valor zero para não definir um limite.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    title="Planeado"
                    value={plannedAmount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'})}
                />
                 <StatCard 
                    title="Gasto"
                    value={spentAmount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'})}
                />
                 <StatCard 
                    title="Diferença"
                    value={difference.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR'})}
                    color={difference >= 0 ? 'text-green-500' : 'text-red-500'}
                />
            </div>
            
            <div className="pt-4">
                <div className="flex justify-between text-sm mb-1 font-medium text-gray-600 dark:text-gray-300">
                    <span>Progresso do Orçamento Geral</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-4">
                    <div 
                        className={`h-4 rounded-full transition-all duration-500 ${progressBarColor}`} 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                {plannedAmount > 0 && (
                    <div className="text-right text-sm mt-1">
                        {isOverBudget ? (
                            <p className="font-semibold text-red-500">
                                {Math.abs(difference).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} acima
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                                Resta: {difference.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="max-w-sm mx-auto space-y-2 pt-4">
                 <label htmlFor="overall-amount" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300">Definir Limite Global</label>
                 <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-lg">€</span>
                    </div>
                    <input
                        type="text"
                        inputMode="decimal"
                        id="overall-amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 text-2xl text-center font-bold"
                    />
                </div>
            </div>
             <div className="flex justify-center pt-4">
                <button
                    onClick={handleSave}
                    className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ease-in-out ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isSaved ? 'Guardado!' : 'Guardar Orçamento'}
                </button>
            </div>
        </div>
    );
}

const BudgetPlanningView: React.FC = () => {
    const [mode, setMode] = useState<'category' | 'overall'>('category');
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Planeamento de Orçamentos</h1>
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
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex rounded-md shadow-sm mb-6 max-w-sm mx-auto" role="group">
                    <button
                        type="button"
                        onClick={() => setMode('category')}
                        className={`w-full px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-l-lg transition-colors ${mode === 'category' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Por Categoria
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('overall')}
                        className={`w-full px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-600 rounded-r-lg transition-colors ${mode === 'overall' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        Geral
                    </button>
                </div>

                {mode === 'category' ? <CategoryBudgetPlanner displayCycleString={displayCycleString} /> : <OverallBudgetPlanner displayCycleString={displayCycleString} />}
            </div>
        </div>
    );
};

export default BudgetPlanningView;