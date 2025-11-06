
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface IncomeExpenseBarChartProps {
    transactions: Transaction[];
    cycle: { start: Date; end: Date };
}

const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ transactions, cycle }) => {
  
  const data = React.useMemo(() => {
    const dailyData: { [key: string]: { name: string; Receita: number; Despesa: number } } = {};
    const date = new Date(cycle.start);
    
    // Ensure we don't get an infinite loop if dates are invalid
    const endDate = new Date(cycle.end);
    let guard = 0;
    
    while(date <= endDate && guard < 367) {
      const formattedDate = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit'});
      dailyData[formattedDate] = { name: formattedDate, Receita: 0, Despesa: 0 };
      date.setDate(date.getDate() + 1);
      guard++;
    }
    
    transactions.forEach(t => {
      // Robustly parse date string to avoid timezone issues
      const parts = t.date.split('-').map(s => parseInt(s, 10));
      const transactionDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const formattedTransactionDate = transactionDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit'});
      
      if(dailyData[formattedTransactionDate]) {
        if(t.type === TransactionType.INCOME) {
          dailyData[formattedTransactionDate].Receita += t.amount;
        } else if (t.type === TransactionType.EXPENSE) {
          dailyData[formattedTransactionDate].Despesa += t.amount;
        }
      }
    });

    return Object.values(dailyData);
  }, [transactions, cycle]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value: number) => `€${value}`} />
        <Tooltip
            formatter={(value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                borderColor: '#555',
                borderRadius: '0.5rem'
            }}
            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
        />
        <Legend />
        <Bar dataKey="Receita" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Despesa" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;
