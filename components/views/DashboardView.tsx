

import * as React from 'react';
import { useAppContext } from '../../context/AppContext';
import CategoryPieChart from '../charts/CategoryPieChart';
import IncomeCategoryPieChart from '../charts/IncomeCategoryPieChart';
import IncomeExpenseBarChart from '../charts/IncomeExpenseBarChart';
import FinancialEvolutionChart from '../charts/FinancialEvolutionChart';
import AdvancedReports from '../reports/AdvancedReports';
import { ChevronLeftIcon, ChevronRightIcon, DashboardIcon, DocumentTextIcon } from '../icons';
import { CycleSettings, Transaction, TransactionType } from '../../types';

// Helper function to get the start date of a monthly cycle
const getMonthlyStartDate = (year: number, month: number, settings: CycleSettings): Date => {
    const { monthlyStartType, startDay } = settings;

    if (monthlyStartType === 'fixed') {
        return new Date(year, month, startDay);
    }
    
    const targetWeekday = startDay; // 0-6

    if (monthlyStartType === 'first_weekday') {
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayWeekday = firstDayOfMonth.getDay();
        let dayOffset = targetWeekday - firstDayWeekday;
        if (dayOffset < 0) dayOffset += 7;
        return new Date(year, month, 1 + dayOffset);
    } else { // 'last_weekday'
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const lastDayWeekday = lastDayOfMonth.getDay();
        
        let diff = lastDayWeekday - targetWeekday;
        if (diff < 0) diff += 7;
        
        const resultDate = new Date(lastDayOfMonth);
        resultDate.setDate(lastDayOfMonth.getDate() - diff);
        return resultDate;
    }
};

// Helper function to get the start and end dates for a given date within a cycle
const getCycleDates = (dateInCycle: Date, settings: CycleSettings): { start: Date, end: Date } => {
    const today = new Date(dateInCycle);
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date;

    if (settings.frequency === 'monthly') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const currentMonthStartDate = getMonthlyStartDate(currentYear, currentMonth, settings);
        
        if (today >= currentMonthStartDate) {
            startDate = currentMonthStartDate;
            const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
            const nextMonthStartDate = getMonthlyStartDate(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), settings);
            endDate = new Date(nextMonthStartDate.getTime() - 1);
        } else {
            const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
            startDate = getMonthlyStartDate(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), settings);
            endDate = new Date(currentMonthStartDate.getTime() - 1);
        }
    } else { // weekly
        const startDayOfWeek = settings.startDay;
        const currentDayOfWeek = today.getDay();
        
        startDate = new Date(today);
        let diff = currentDayOfWeek - startDayOfWeek;
        if (diff < 0) diff += 7;
        startDate.setDate(today.getDate() - diff);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { start: startDate, end: endDate };
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-between">
    <h3 className="text-lg text-gray-500 dark:text-gray-400">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const CycleDashboard: React.FC = () => {
  const { transactions, cycleSettings, accounts, chartSettings } = useAppContext();
  const [timeFrame, setTimeFrame] = React.useState<'cycle' | 'month'>('cycle');
  const [displayDate, setDisplayDate] = React.useState(new Date());

  React.useEffect(() => {
      setDisplayDate(new Date());
  }, [cycleSettings]);

  const currentPeriod = React.useMemo(() => {
    if (timeFrame === 'month') {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const start = new Date(year, month, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(year, month + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }
    return getCycleDates(displayDate, cycleSettings);
  }, [displayDate, timeFrame, cycleSettings]);

  const periodLabel = React.useMemo(() => {
    if (timeFrame === 'month') {
        return displayDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }
    const formatDate = (date: Date) => date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
    return `${formatDate(currentPeriod.start)} - ${formatDate(currentPeriod.end)}`;
  }, [currentPeriod, timeFrame, displayDate]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionTimestamp = new Date(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth(), transactionDate.getUTCDate()).getTime();
      const periodStartTimestamp = new Date(currentPeriod.start.getFullYear(), currentPeriod.start.getMonth(), currentPeriod.start.getDate()).getTime();
      const periodEndTimestamp = new Date(currentPeriod.end.getFullYear(), currentPeriod.end.getMonth(), currentPeriod.end.getDate()).getTime();
      
      return transactionTimestamp >= periodStartTimestamp && transactionTimestamp <= periodEndTimestamp;
    });
  }, [transactions, currentPeriod]);
  
  const { totalBalance, cycleIncome, cycleExpense } = React.useMemo(() => {
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

    const cycleTotals = filteredTransactions.reduce(
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
  }, [transactions, accounts, filteredTransactions]);

  const handlePrev = () => {
    const newDate = new Date(displayDate);
    if (timeFrame === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
    } else { // cycle
        if (cycleSettings.frequency === 'monthly') {
            newDate.setTime(currentPeriod.start.getTime() - 86400000); 
        } else { // weekly
            newDate.setDate(currentPeriod.start.getDate() - 7);
        }
    }
    setDisplayDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(displayDate);
    if (timeFrame === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
    } else { // cycle
        if (cycleSettings.frequency === 'monthly') {
            newDate.setTime(currentPeriod.end.getTime() + 86400000);
        } else { // weekly
            newDate.setDate(currentPeriod.start.getDate() + 7);
        }
    }
    setDisplayDate(newDate);
  };

  const expenseTransactions = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
  const incomeTransactions = filteredTransactions.filter(t => t.type === TransactionType.INCOME);
  const enabledChartsCount = Object.values(chartSettings).filter(Boolean).length;


  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex rounded-md shadow-sm" role="group">
              <button
                  type="button"
                  onClick={() => { setTimeFrame('cycle'); setDisplayDate(new Date()); }}
                  className={`px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-l-lg transition-colors ${timeFrame === 'cycle' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                  Ciclo
              </button>
              <button
                  type="button"
                  onClick={() => { setTimeFrame('month'); setDisplayDate(new Date()); }}
                  className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-600 rounded-r-lg transition-colors ${timeFrame === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                  Mês
              </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Período anterior">
                  <ChevronLeftIcon className="w-6 h-6"/>
              </button>
              <p className="text-center font-semibold text-lg text-blue-500 w-64 capitalize" aria-live="polite">
                  {periodLabel}
              </p>
               <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Próximo período">
                  <ChevronRightIcon className="w-6 h-6"/>
              </button>
          </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Saldo Total" value={(totalBalance ?? 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} color={totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'} />
        <StatCard title="Receitas no Período" value={(cycleIncome ?? 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} color="text-green-500" />
        <StatCard title="Despesas no Período" value={(cycleExpense ?? 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} color="text-red-500" />
        <StatCard title="Movimentos no Período" value={filteredTransactions.length.toString()} color="text-gray-600 dark:text-gray-300" />
      </div>
      
      {filteredTransactions.length > 0 ? (
        enabledChartsCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {chartSettings.expensesByCategory && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
                <div className="h-80">
                  <CategoryPieChart transactions={expenseTransactions} />
                </div>
              </div>
            )}
            {chartSettings.incomeByCategory && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Receitas por Categoria</h2>
                <div className="h-80">
                  <IncomeCategoryPieChart transactions={incomeTransactions} />
                </div>
              </div>
            )}
            {chartSettings.expenseEvolution && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Evolução das Despesas</h2>
                 <div className="h-80">
                  <FinancialEvolutionChart transactions={expenseTransactions} cycle={currentPeriod} />
                </div>
              </div>
            )}
            {chartSettings.dailyMovements && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Movimentos Diários</h2>
                 <div className="h-80">
                  <IncomeExpenseBarChart transactions={filteredTransactions} cycle={currentPeriod} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhum gráfico para exibir.</h2>
              <p className="text-gray-400 dark:text-gray-500 mt-2">Pode ativar os gráficos que deseja ver em Configurações &gt; Personalização do Dashboard.</p>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Nenhuma transação neste período.</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Navegue para outros períodos ou adicione transações para ver os gráficos!</p>
        </div>
      )}
    </div>
  );
};


const DashboardView: React.FC = () => {
    const [viewMode, setViewMode] = React.useState<'cycle' | 'reports'>('cycle');
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gráficos & Análise</h1>
          <div className="mt-4 inline-flex rounded-lg shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('cycle')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-l-lg transition-colors ${viewMode === 'cycle' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <DashboardIcon className="w-5 h-5" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('reports')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 dark:border-gray-600 rounded-r-lg transition-colors ${viewMode === 'reports' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <DocumentTextIcon className="w-5 h-5" />
              Relatórios
            </button>
          </div>
        </div>
        
        {viewMode === 'cycle' ? <CycleDashboard /> : <AdvancedReports />}

      </div>
    );
};


export default DashboardView;