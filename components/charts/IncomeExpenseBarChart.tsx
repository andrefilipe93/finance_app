
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { TransactionType } from '../../types';

const IncomeExpenseBarChart: React.FC = () => {
  const { cycleTransactions, currentCycle } = useAppContext();
  
  const data = useMemo(() => {
    const dailyData: { [key: string]: { name: string; Receita: number; Despesa: number } } = {};
    const date = new Date(currentCycle.start);
    
    while(date <= currentCycle.end) {
      const formattedDate = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit'});
      dailyData[formattedDate] = { name: formattedDate, Receita: 0, Despesa: 0 };
      date.setDate(date.getDate() + 1);
    }
    
    cycleTransactions.forEach(t => {
      const transactionDate = new Date(t.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit'});
      if(dailyData[transactionDate]) {
        if(t.type === TransactionType.INCOME) {
          dailyData[transactionDate].Receita += t.amount;
        } else {
          dailyData[transactionDate].Despesa += t.amount;
        }
      }
    });

    return Object.values(dailyData);

  }, [cycleTransactions, currentCycle]);


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
        <YAxis tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `€${Number(value).toLocaleString('pt-PT')}`}/>
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