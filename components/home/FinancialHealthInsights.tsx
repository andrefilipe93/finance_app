import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';

interface InsightCardProps {
    emoji: string;
    title: string;
    description: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ emoji, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/60 rounded-lg">
        <div className="text-2xl pt-1">{emoji}</div>
        <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
        </div>
    </div>
);


const FinancialHealthInsights: React.FC = () => {
    const { transactions, cycleTransactions, categories } = useAppContext();

    const { comparisonInsight, topCategoryInsight, hasCurrentExpenses } = useMemo(() => {
        // --- Insight 1: Comparação com a média ---
        const today = new Date();
        const pastMonthsTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            const isCurrentMonth = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
            return !isCurrentMonth && t.type === TransactionType.EXPENSE;
        });

        let comparisonInsight = null;
        if (pastMonthsTransactions.length > 0) {
            const monthlyTotals: { [monthKey: string]: number } = {};
            pastMonthsTransactions.forEach(t => {
                const monthKey = t.date.substring(0, 7); // YYYY-MM
                if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
                monthlyTotals[monthKey] += t.amount;
            });

            const pastMonthValues = Object.values(monthlyTotals);
            const averageSpend = pastMonthValues.reduce((sum, val) => sum + val, 0) / pastMonthValues.length;

            const currentCycleSpend = cycleTransactions
                .filter(t => t.type === TransactionType.EXPENSE)
                .reduce((sum, t) => sum + t.amount, 0);
            
            if (currentCycleSpend > 0) {
                const difference = currentCycleSpend - averageSpend;
                const isAbove = difference > 0;
                const diffText = Math.abs(difference).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

                comparisonInsight = {
                    emoji: isAbove ? '📈' : '📉',
                    title: `Gastos ${isAbove ? 'acima' : 'abaixo'} da média`,
                    description: (
                        <p>
                            Este mês, os seus gastos estão <strong className={isAbove ? 'text-red-500' : 'text-green-500'}>{diffText} {isAbove ? 'acima' : 'abaixo'}</strong> da sua média mensal.
                        </p>
                    )
                };
            }
        }
        
        // --- Insight 2: Principal Categoria de Despesa ---
        const currentCycleExpenses = cycleTransactions.filter(t => t.type === TransactionType.EXPENSE && t.categoryId);
        let topCategoryInsight = null;

        if (currentCycleExpenses.length > 0) {
            const spendsByCategory: { [catId: string]: number } = {};
            currentCycleExpenses.forEach(t => {
                if (!spendsByCategory[t.categoryId!]) spendsByCategory[t.categoryId!] = 0;
                spendsByCategory[t.categoryId!] += t.amount;
            });

            const topCategoryEntry = Object.entries(spendsByCategory).sort((a, b) => b[1] - a[1])[0];
            const topCategoryId = topCategoryEntry[0];
            const topCategoryAmount = topCategoryEntry[1];
            const topCategory = categories.find(c => c.id === topCategoryId);

            if (topCategory) {
                topCategoryInsight = {
                    emoji: topCategory.icon,
                    title: 'Foco de Despesa Principal',
                    description: (
                        <p>
                            A sua maior despesa este mês tem sido em <strong>{topCategory.name}</strong>, totalizando <strong>{topCategoryAmount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</strong>.
                        </p>
                    )
                };
            }
        }

        return { comparisonInsight, topCategoryInsight, hasCurrentExpenses: currentCycleExpenses.length > 0 };

    }, [transactions, cycleTransactions, categories]);

    const insightsToShow = [comparisonInsight, topCategoryInsight].filter(Boolean);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Diagnóstico Financeiro</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                {insightsToShow.length > 0 ? (
                    <div className="space-y-4">
                        {insightsToShow.map(insight => (
                            <InsightCard 
                                key={insight!.title}
                                emoji={insight!.emoji}
                                title={insight!.title}
                                description={insight!.description}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-6">
                        {hasCurrentExpenses
                            ? "Continue a registar para receber mais análises detalhadas."
                            : "Adicione despesas este mês para começar a receber análises! 📈"
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default FinancialHealthInsights;