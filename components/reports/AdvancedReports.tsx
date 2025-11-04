import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType, Category } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
  <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg text-center">
    <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
  </div>
);


const AdvancedReports: React.FC = () => {
    const { transactions, categories, accounts } = useAppContext();

    const today = new Date();
    const startOfMonth = formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
    const endOfMonth = formatDateForInput(new Date(today.getFullYear(), today.getMonth() + 1, 0));

    const [startDate, setStartDate] = useState(startOfMonth);
    const [endDate, setEndDate] = useState(endOfMonth);
    const [type, setType] = useState<string>('all');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);

    const availableCategories = useMemo(() => {
        if (type === 'all') return categories;
        return categories.filter(c => c.type === type);
    }, [categories, type]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
        setSelectedCategories([]); // Reset categories on type change
    };

    const setDatePreset = (preset: 'this_month' | 'last_month' | 'this_year') => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (preset === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'last_month') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (preset === 'this_year') {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        }
        
        setStartDate(formatDateForInput(start));
        setEndDate(formatDateForInput(end));
    };

    const handleGenerateReport = () => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        const result = transactions.filter(t => {
            const transactionDate = new Date(`${t.date}T${t.time || '00:00'}`);
            
            if (transactionDate < start || transactionDate > end) return false;
            if (type !== 'all' && t.type !== type) return false;
            if (selectedCategories.length > 0 && !selectedCategories.includes(t.categoryId || '')) return false;
            if (selectedAccounts.length > 0 && !selectedAccounts.includes(t.accountId)) return false;

            return true;
        });
        
        setFilteredTransactions(result);
    };

    const { summary, chartData } = useMemo(() => {
        if (!filteredTransactions) return { summary: null, chartData: [] };

        const summaryData = filteredTransactions.reduce((acc, t) => {
            if (t.type === TransactionType.INCOME) {
                acc.income += t.amount;
            } else if (t.type === TransactionType.EXPENSE) {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });

        const categoryTotals: { [key: string]: { name: string; icon: string, color: string, total: number }} = {};

        filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE && t.categoryId)
            .forEach(t => {
                const category = categories.find(c => c.id === t.categoryId);
                if (!category) return;

                if (!categoryTotals[category.id]) {
                    categoryTotals[category.id] = { name: category.name, icon: category.icon, color: category.color, total: 0 };
                }
                categoryTotals[category.id].total += t.amount;
            });

        const sortedChartData = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
        
        return { summary: summaryData, chartData: sortedChartData };
    }, [filteredTransactions, categories]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Filtros do Relatório</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className="text-sm font-medium">Data de Início</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm p-2" />
                    </div>
                     <div>
                        <label htmlFor="end-date" className="text-sm font-medium">Data de Fim</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm p-2" />
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => setDatePreset('this_month')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Este Mês</button>
                    <button onClick={() => setDatePreset('last_month')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Mês Passado</button>
                    <button onClick={() => setDatePreset('this_year')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Este Ano</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                     <div>
                        <label htmlFor="type" className="text-sm font-medium">Tipo</label>
                        <select id="type" value={type} onChange={handleTypeChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm p-2">
                            <option value="all">Todos</option>
                            <option value="expense">Despesas</option>
                            <option value="income">Receitas</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="categories" className="text-sm font-medium">Categorias</label>
                        {/* FIX: Explicitly type `option` as HTMLOptionElement to resolve type inference issue. */}
                        <select id="categories" multiple value={selectedCategories} onChange={e => setSelectedCategories(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm p-2 h-24">
                            {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="accounts" className="text-sm font-medium">Contas</label>
                        {/* FIX: Explicitly type `option` as HTMLOptionElement to resolve type inference issue. */}
                        <select id="accounts" multiple value={selectedAccounts} onChange={e => setSelectedAccounts(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm p-2 h-24">
                             {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerateReport} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Gerar Relatório</button>
                </div>
            </div>

            {filteredTransactions === null && (
                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Pronto para analisar?</h2>
                    <p className="text-gray-400 dark:text-gray-500 mt-2">Configure os filtros acima e clique em "Gerar Relatório".</p>
                </div>
            )}

            {filteredTransactions !== null && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Total Receitas" value={summary?.income.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }) ?? '€0,00'} />
                        <StatCard title="Total Despesas" value={summary?.expense.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }) ?? '€0,00'} />
                        <StatCard title="Saldo do Período" value={( (summary?.income ?? 0) - (summary?.expense ?? 0) ).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} />
                        <StatCard title="Nº de Movimentos" value={filteredTransactions.length} />
                    </div>

                    {chartData.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
                             <h3 className="text-xl font-semibold mb-4">Despesas por Categoria</h3>
                             <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', borderColor: '#555', borderRadius: '0.5rem' }} />
                                        <Bar dataKey="total" name="Total" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
                         <h3 className="text-xl font-semibold mb-4">Lista de Movimentos</h3>
                         <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                            {filteredTransactions.map(t => {
                                const category = categories.find(c => c.id === t.categoryId);
                                return (
                                <li key={t.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{t.description}</p>
                                        <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' })} &bull; {category?.name || 'Transferência'}</p>
                                    </div>
                                    <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{t.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                                </li>
                                )
                            })}
                         </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedReports;