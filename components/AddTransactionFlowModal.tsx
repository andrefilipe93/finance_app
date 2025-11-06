
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';

const AddTransactionFlowModal: React.FC = () => {
  const { 
    isAddTransactionModalOpen, 
    closeAddTransactionModal, 
    categories, 
    accounts, 
    addTransaction,
    updateTransaction,
    transactionToEditInFlow 
  } = useAppContext();

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const isEditing = transactionToEditInFlow !== null && !!transactionToEditInFlow.id;
  const isDuplicating = transactionToEditInFlow !== null && !transactionToEditInFlow.id;
  
  const activeAccounts = useMemo(() => accounts.filter(a => a.isActive), [accounts]);
  
  const isPending = useMemo(() => {
    if (!transactionToEditInFlow) return false;
    
    const todayString = new Date().toISOString().split('T')[0];
    const nowString = new Date().toTimeString().slice(0, 5);

    const { date: tDate, time: tTime } = transactionToEditInFlow;

    if (tDate > todayString) return true;
    if (tDate === todayString && tTime > nowString) return true;
    return false;
  }, [transactionToEditInFlow]);

  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  // Effect to initialize the form state when the modal opens
  useEffect(() => {
    if (isAddTransactionModalOpen) {
      if (transactionToEditInFlow) {
        // Populate state for editing or duplication
        setType(transactionToEditInFlow.type);
        setAmount(String(transactionToEditInFlow.amount).replace('.', ','));
        setDescription(transactionToEditInFlow.description);
        setDate(transactionToEditInFlow.date);
        setTime(transactionToEditInFlow.time || '00:00');
        setCategoryId(transactionToEditInFlow.categoryId || '');
        setAccountId(transactionToEditInFlow.accountId);
        setDestinationAccountId(transactionToEditInFlow.destinationAccountId || '');
      } else {
        // Set initial state for new transaction
        const now = new Date();
        setType(TransactionType.EXPENSE);
        setAmount('');
        setDescription('');
        setDate(now.toISOString().split('T')[0]);
        setTime(now.toTimeString().slice(0, 5));
        
        const initialCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
        setCategoryId(initialCategories[0]?.id || '');
        
        if (activeAccounts.length > 0) {
          setAccountId(activeAccounts[0].id);
          const differentAccount = activeAccounts.find(a => a.id !== activeAccounts[0].id);
          setDestinationAccountId(differentAccount?.id || '');
        } else {
          setAccountId('');
          setDestinationAccountId('');
        }
      }
    }
  }, [isAddTransactionModalOpen, transactionToEditInFlow, accounts, categories, activeAccounts]);


  if (!isAddTransactionModalOpen) {
    return null;
  }

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === TransactionType.TRANSFER) {
        setCategoryId('');
        // Ensure destination is not the same as source
        if (accountId === destinationAccountId) {
            const differentAccount = activeAccounts.find(a => a.id !== accountId);
            setDestinationAccountId(differentAccount?.id || '');
        }
    } else {
        const newCategories = categories.filter(c => c.type === newType);
        setCategoryId(newCategories[0]?.id || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor, insira um valor numérico válido e positivo.");
      return;
    }

    if (activeAccounts.length === 0) {
        alert("É necessário ter pelo menos uma conta ativa para adicionar um movimento.");
        return;
    }
    if (!description.trim()) {
        alert("Por favor, adicione uma descrição.");
        return;
    }
    if (type !== TransactionType.TRANSFER && !categoryId) {
        alert("Por favor, selecione uma categoria.");
        return;
    }
    if (type === TransactionType.TRANSFER && accountId === destinationAccountId) {
        alert("A conta de origem e destino não podem ser a mesma.");
        return;
    }
    if (type === TransactionType.TRANSFER && !destinationAccountId) {
        alert("Por favor, selecione uma conta de destino.");
        return;
    }
    
    const transactionPayload: Omit<Transaction, 'id' | 'createdAt'> = {
        description: description,
        amount: parsedAmount,
        type: type,
        date: date,
        time: time,
        accountId: accountId,
        categoryId: type === TransactionType.TRANSFER ? undefined : categoryId,
        destinationAccountId: type === TransactionType.TRANSFER ? destinationAccountId : undefined,
    };
    
    if (isEditing) {
        updateTransaction({ ...transactionToEditInFlow, ...transactionPayload });
    } else {
        addTransaction(transactionPayload);
    }
    closeAddTransactionModal();
  };

  const commonSelectClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 text-base";
  const commonInputClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 text-base";

  const modalTitle = (() => {
    if (isEditing) {
        return isPending ? 'Confirmar Movimento' : 'Editar Movimento';
    }
    if (isDuplicating) {
        return 'Duplicar Movimento';
    }
    return 'Novo Movimento';
  })();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={closeAddTransactionModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
                <button
                    type="button"
                    onClick={closeAddTransactionModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none"
                    aria-label="Fechar modal"
                >
                &times;
                </button>
            </div>
            
            <div className="my-8 space-y-6">
                <div>
                    <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Qual o tipo de movimento?</label>
                    <div className="flex rounded-md shadow-sm">
                      <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full px-4 py-3 text-lg font-semibold rounded-l-md transition ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
                      <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full px-4 py-3 text-lg font-semibold transition ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
                      <button type="button" onClick={() => handleTypeChange(TransactionType.TRANSFER)} className={`w-full px-4 py-3 text-lg font-semibold rounded-r-md transition ${type === TransactionType.TRANSFER ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Transferência</button>
                    </div>
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Qual o valor?</label>
                    {isPending && (
                        <p className="text-center text-xs text-amber-600 dark:text-amber-400 mb-2 bg-amber-50 dark:bg-amber-900/40 p-2 rounded-md">
                            Este é um movimento agendado. Por favor, confirme ou ajuste o valor final.
                        </p>
                    )}
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-lg">€</span>
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0,00"
                            className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10 pr-4 py-3 text-2xl text-center font-bold"
                            required
                        />
                    </div>
                </div>

                {type !== TransactionType.TRANSFER && (
                    <div>
                         <label htmlFor="category" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">E a categoria?</label>
                         <select 
                            id="category" 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)} 
                            className={commonSelectClasses} 
                            required
                        >
                          {availableCategories.length > 0 ? (
                            availableCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
                          ) : (
                            <option value="" disabled>Nenhuma categoria de {type === TransactionType.EXPENSE ? 'despesa' : 'receita'}.</option>
                          )}
                        </select>
                    </div>
                )}
                
                {type === TransactionType.TRANSFER ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="account" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Da conta de origem</label>
                            <select id="account" value={accountId} onChange={e => setAccountId(e.target.value)} className={commonSelectClasses} required>
                                {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="destinationAccount" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Para a conta de destino</label>
                            <select id="destinationAccount" value={destinationAccountId} onChange={e => setDestinationAccountId(e.target.value)} className={commonSelectClasses} required>
                                 {activeAccounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                                 {activeAccounts.filter(a => a.id !== accountId).length === 0 && <option disabled>Nenhuma outra conta</option>}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label htmlFor="account-single" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Em que conta?</label>
                        <select id="account-single" value={accountId} onChange={e => setAccountId(e.target.value)} className={commonSelectClasses} required>
                          {activeAccounts.length > 0 ? (
                            activeAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)
                          ) : (
                            <option value="" disabled>Nenhuma conta ativa.</option>
                          )}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="description" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Qual a descrição?</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ex: Supermercado, Renda..."
                        className={commonInputClasses}
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={commonInputClasses}
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Hora</label>
                        <input
                            id="time"
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className={commonInputClasses}
                            required
                        />
                    </div>
                </div>

            </div>

            <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={closeAddTransactionModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isEditing ? 'Guardar Alterações' : isDuplicating ? 'Adicionar Cópia' : 'Adicionar Movimento'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionFlowModal;
