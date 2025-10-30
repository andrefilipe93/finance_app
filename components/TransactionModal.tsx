import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';

const TransactionModal: React.FC = () => {
  const { isModalOpen, closeModal, addTransaction, updateTransaction, transactionToEdit, categories, accounts } = useAppContext();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(''); // Source Account
  const [destinationAccountId, setDestinationAccountId] = useState(''); // Destination Account for Transfers

  // Effect to setup form state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (transactionToEdit) {
        setDescription(transactionToEdit.description);
        setAmount(String(transactionToEdit.amount));
        setType(transactionToEdit.type);
        setDate(transactionToEdit.date);
        setCategoryId(transactionToEdit.categoryId || '');
        setAccountId(transactionToEdit.accountId);
        setDestinationAccountId(transactionToEdit.destinationAccountId || '');
      } else {
        // Reset for a new transaction
        setDescription('');
        setAmount('');
        setType(TransactionType.EXPENSE);
        setDate(new Date().toISOString().split('T')[0]);
        
        const initialExpenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
        setCategoryId(initialExpenseCategories.length > 0 ? initialExpenseCategories[0].id : '');

        if (accounts.length > 0) setAccountId(accounts[0].id);
        if (accounts.length > 1) {
          setDestinationAccountId(accounts[1].id);
        } else if (accounts.length > 0) {
          setDestinationAccountId(accounts[0].id);
        }
      }
    }
  }, [transactionToEdit, isModalOpen, categories, accounts]);

  // Effect to handle category changes when transaction type changes (BUG FIX)
  useEffect(() => {
    if (!isModalOpen) return;

    if (type === TransactionType.TRANSFER) {
      setCategoryId('');
      return;
    }
    
    const availableCategories = categories.filter(c => c.type === type);
    const isCategoryValid = availableCategories.some(c => c.id === categoryId);

    if (!isCategoryValid) {
      setCategoryId(availableCategories.length > 0 ? availableCategories[0].id : '');
    }
  }, [type, categoryId, isModalOpen, categories]);


  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === TransactionType.TRANSFER && accountId === destinationAccountId) {
      alert("A conta de origem e destino não podem ser a mesma.");
      return;
    }

    const transactionData = {
      description,
      amount: parseFloat(amount.replace(',', '.')),
      type,
      date,
      accountId,
      ...(type === TransactionType.TRANSFER
        ? { destinationAccountId }
        : { categoryId }),
    };

    if (transactionToEdit) {
      updateTransaction({ 
        ...transactionData, 
        id: transactionToEdit.id, 
        createdAt: transactionToEdit.createdAt
      });
    } else {
      addTransaction(transactionData as Omit<Transaction, 'id' | 'createdAt'>);
    }
    closeModal();
  };
  
  const availableCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-4">{transactionToEdit ? 'Editar' : 'Novo'} Movimento</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full px-4 py-2 rounded-l-md transition ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full px-4 py-2 transition ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
              <button type="button" onClick={() => setType(TransactionType.TRANSFER)} className={`w-full px-4 py-2 rounded-r-md transition ${type === TransactionType.TRANSFER ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Transferência</button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                </div>
                <input type="text" inputMode="decimal" step="0.01" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-7" required />
            </div>
          </div>

          {type === TransactionType.TRANSFER ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origem</label>
                  <select id="account" value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="destinationAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destino</label>
                  <select id="destinationAccount" value={destinationAccountId} onChange={e => setDestinationAccountId(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                  {availableCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta</label>
                <select id="account" value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{transactionToEdit ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;