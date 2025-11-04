import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface FinancialEvolutionChartProps {
    transactions: Transaction[];
    cycle: { start: Date; end: Date };
}

const FinancialEvolutionChart: React.FC<FinancialEvolutionChartProps> = ({ transactions, cycle }) => {
  
  const data = useMemo(() => {
    const dailyExpenses: { [key: string]: number } = {};
    
    transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .forEach(t => {
            // Robustly parse date string to avoid timezone issues
            const parts = t.date.split('-').map(s => parseInt(s, 10));
            const transactionDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const formattedDate = transactionDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            dailyExpenses[formattedDate] = (dailyExpenses[formattedDate] || 0) + t.amount;
        });

    const chartData = [];
    let cumulativeExpense = 0;
    const date = new Date(cycle.start);
    const endDate = new Date(cycle.end);
    let guard = 0;

    while(date <= endDate && guard < 367) {
        const formattedDate = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
        cumulativeExpense += (dailyExpenses[formattedDate] || 0);
        chartData.push({ name: formattedDate, DespesaAcumulada: cumulativeExpense });
        date.setDate(date.getDate() + 1);
        guard++;
    }

    return chartData;
  }, [transactions, cycle]);

  if (transactions.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Nenhuma despesa para exibir.</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <defs>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value: number) => `€${value}`} />
        <Tooltip
            formatter={(value: number) => [value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }), 'Despesa Acumulada']}
            contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderColor: '#555',
                borderRadius: '0.5rem'
            }}
            cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Area type="monotone" dataKey="DespesaAcumulada" name="Despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default FinancialEvolutionChart;
