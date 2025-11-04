import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Budget, TransactionType } from '../types';
import { TrashIcon } from './icons';

const BudgetModal: React.FC = () => {
  const {
    isBudgetModalOpen,
    closeBudgetModal,
    budgetToEdit,
    budgets,
    categories,
    addBudget,
    updateBudget,
    deleteBudget,
    currentCycle,
    budgetCreationCycle,
  } = useAppContext();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const operatingCycle = useMemo(() => {
    if (budgetToEdit) return budgetToEdit.cycle;
    if (budgetCreationCycle) return budgetCreationCycle;
    
    const date = currentCycle.start;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [budgetToEdit, budgetCreationCycle, currentCycle]);


  const availableCategories = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
    const categoriesWithBudget = budgets
        .filter(b => b.cycle === operatingCycle)
        .map(b => b.categoryId);

    if (budgetToEdit) {
        return expenseCategories; // Allow seeing the current category when editing
    }

    return expenseCategories.filter(c => !categoriesWithBudget.includes(c.id));
  }, [categories, budgets, operatingCycle, budgetToEdit]);

  useEffect(() => {
    if (isBudgetModalOpen) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.categoryId);
        setAmount(String(budgetToEdit.amount).replace('.', ','));
      } else {
        setCategoryId(availableCategories[0]?.id || '');
        setAmount('');
      }
    }
  }, [isBudgetModalOpen, budgetToEdit, availableCategories]);
  
  if (!isBudgetModalOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, insira um valor de orçamento válido e positivo.');
      return;
    }
    if (!categoryId) {
        alert('Por favor, selecione uma categoria.');
        return;
    }

    const budgetData = {
      categoryId,
      amount: parsedAmount,
      cycle: operatingCycle,
    };

    if (budgetToEdit) {
      updateBudget({ ...budgetToEdit, ...budgetData });
    } else {
      addBudget(budgetData);
    }
    closeBudgetModal();
  };
  
  const handleDelete = () => {
      if (budgetToEdit && window.confirm("Tem a certeza que deseja eliminar este orçamento?")) {
          deleteBudget(budgetToEdit.id);
          closeBudgetModal();
      }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={closeBudgetModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{budgetToEdit ? 'Editar' : 'Novo'} Orçamento</h2>
           {budgetToEdit && (
            <button
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Eliminar orçamento"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
           )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!budgetToEdit}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))
              ) : (
                <option disabled>
                  {budgetToEdit ? 'Sem categorias' : 'Todas as categorias já têm orçamento'}
                </option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor do Orçamento
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="text"
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-7"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={closeBudgetModal}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {budgetToEdit ? 'Guardar' : 'Criar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;