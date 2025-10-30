
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';

const IncomeExpenseBarChart: React.FC = () => {
  const { transactions } = useAppContext();
  
  const data = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      name: d.toLocaleString('default', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      Receita: 0,
      Despesa: 0,
    };
  }).reverse();

  transactions.forEach(t => {
    const transactionDate = new Date(t.date);
    const month = transactionDate.getMonth();
    const year = transactionDate.getFullYear();
    const dataPoint = data.find(d => d.month === month && d.year === year);
    if (dataPoint) {
      if (t.type === TransactionType.INCOME) {
        dataPoint.Receita += t.amount;
      } else {
        dataPoint.Despesa += t.amount;
      }
    }
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `€${value/1000}k`}/>
        <Tooltip 
            formatter={(value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
            contentStyle={{ 
                backgroundColor: 'rgba(30, 30, 30, 0.8)', 
                borderColor: '#555',
                borderRadius: '0.5rem'
            }}
        />
        <Legend />
        <Bar dataKey="Receita" fill="#32cd32" />
        <Bar dataKey="Despesa" fill="#ff6384" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;