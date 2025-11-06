

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';

interface IncomeCategoryPieChartProps {
    transactions: Transaction[];
}

const IncomeCategoryPieChart: React.FC<IncomeCategoryPieChartProps> = ({ transactions }) => {
  const { categories } = useAppContext();

  const data = useMemo(() => {
    return categories
      .filter(c => c.type === TransactionType.INCOME)
      .map(category => {
        const total = transactions
          .filter(t => t.categoryId === category.id && t.type === TransactionType.INCOME)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: category.name,
          value: total,
          color: category.color,
        };
      })
      .filter(item => item.value > 0);
  }, [categories, transactions]);

  if (data.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">Nenhuma receita para exibir.</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          contentStyle={{ 
            backgroundColor: 'rgba(30, 30, 30, 0.8)', 
            borderColor: '#555',
            borderRadius: '0.5rem' 
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default IncomeCategoryPieChart;
