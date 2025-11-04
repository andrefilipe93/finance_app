
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType, Account, Category } from '../types';

type FormState = {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  time: string;
  categoryId: string;
  accountId: string;
  destinationAccountId: string;
}

const getInitialFormState = (accounts: Account[], categories: Category[]): FormState => {
    const now = new Date();
    const activeAccounts = accounts.filter(a => a.isActive);
    const defaultType = TransactionType.EXPENSE;
    const expenseCategories = categories.filter(c => c.type === defaultType);

    const defaultAccountId = activeAccounts[0]?.id || '';
    const defaultCategoryId = expenseCategories[0]?.id || '';
    const defaultDestinationId = activeAccounts.find(a => a.id !== defaultAccountId)?.id || '';

    return {
        description: '',
        amount: '',
        type: defaultType,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        accountId: defaultAccountId,
        categoryId: defaultCategoryId,
        destinationAccountId: defaultDestinationId,
    };
};

const TransactionModal: React.FC = () => {
  const { isModalOpen, closeModal, addTransaction, updateTransaction, transactionToEdit, categories, accounts } = useAppContext();
  
  // Use a state that can be null to ensure it's re-initialized every time the modal opens
  const [formState, setFormState] = React.useState<FormState | null>(null);
  const descriptionInputRef = React.useRef<HTMLInputElement>(null);

  // This effect is the single source of truth for initializing the form when the modal opens.
  React.useEffect(() => {
    if (isModalOpen) {
        let initialState: FormState;
        if (transactionToEdit) {
            initialState = {
                description: transactionToEdit.description,
                amount: String(transactionToEdit.amount).replace('.', ','),
                type: transactionToEdit.type,
                date: transactionToEdit.date,
                time: transactionToEdit.time || '00:00',
                categoryId: transactionToEdit.categoryId || '',
                accountId: transactionToEdit.accountId,
                destinationAccountId: transactionToEdit.destinationAccountId || '',
            };
        } else {
            const activeAccounts = accounts.filter(a => a.isActive);
            if (activeAccounts.length === 0) {
                alert("É necessário ter pelo menos uma conta ativa para adicionar um movimento.");
                closeModal();
                return; // Stop execution to prevent setting state
            }
            initialState = getInitialFormState(accounts, categories);
        }
        setFormState(initialState);
        
        // Focus the description input for new transactions for better UX
        if (!transactionToEdit) {
            setTimeout(() => descriptionInputRef.current?.focus(), 100);
        }
    } else {
        // Clean up state when modal closes to prevent stale data
        setFormState(null);
    }
  }, [isModalOpen, transactionToEdit, accounts, categories, closeModal]);

  if (!isModalOpen || !formState) return null;

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setFormState(prev => {
        if (!prev) return null;
        
        const updatedState = { ...prev, type: newType };
        
        if (newType === TransactionType.TRANSFER) {
            updatedState.categoryId = '';
        } else {
            const availableCategories = categories.filter(c => c.type === newType);
            const isCurrentCategoryValid = availableCategories.some(c => c.id === updatedState.categoryId);
            
            if (!isCurrentCategoryValid) {
                updatedState.categoryId = availableCategories[0]?.id || '';
            }
        }
        return updatedState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState) return;

    if (formState.type === TransactionType.TRANSFER && formState.accountId === formState.destinationAccountId) {
      alert("A conta de origem e destino não podem ser a mesma.");
      return;
    }

    const parsedAmount = parseFloat(formState.amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor, insira um valor numérico válido e positivo.");
      return;
    }

    if (formState.type !== TransactionType.TRANSFER && !formState.categoryId) {
        alert("Por favor, selecione uma categoria. Se não existirem, crie uma em Configurações.");
        return;
    }

    if (!formState.accountId) {
        alert("Por favor, selecione uma conta de origem.");
        return;
    }

    if (formState.type === TransactionType.TRANSFER && !formState.destinationAccountId) {
        alert("Por favor, selecione uma conta de destino.");
        return;
    }

    const transactionPayload: Omit<Transaction, 'id' | 'createdAt'> = {
        description: formState.description,
        amount: parsedAmount,
        type: formState.type,
        date: formState.date,
        time: formState.time,
        accountId: formState.accountId,
        categoryId: formState.type === TransactionType.TRANSFER ? undefined : formState.categoryId,
        destinationAccountId: formState.type === TransactionType.TRANSFER ? formState.destinationAccountId : undefined,
    };

    if (transactionToEdit) {
        updateTransaction({ ...transactionToEdit, ...transactionPayload });
    } else {
        addTransaction(transactionPayload);
    }
    closeModal();
  };
  
  const availableCategories = React.useMemo(() => categories.filter(c => c.type === formState.type), [categories, formState.type]);
  const visibleAccounts = React.useMemo(() => {
      if (transactionToEdit) {
          const involvedAccountIds = new Set([transactionToEdit.accountId, transactionToEdit.destinationAccountId]);
          return accounts.filter(a => a.isActive || involvedAccountIds.has(a.id));
      }
      return accounts.filter(a => a.isActive);
  }, [accounts, transactionToEdit]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-4">{transactionToEdit ? 'Editar' : 'Novo'} Movimento</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full px-4 py-2 rounded-l-md transition ${formState.type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
              <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full px-4 py-2 transition ${formState.type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
              <button type="button" onClick={() => handleTypeChange(TransactionType.TRANSFER)} className={`w-full px-4 py-2 rounded-r-md transition ${formState.type === TransactionType.TRANSFER ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Transferência</button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input ref={descriptionInputRef} type="text" id="description" value={formState.description} onChange={e => handleInputChange('description', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
            <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                </div>
                <input type="text" inputMode="decimal" step="0.01" id="amount" value={formState.amount} onChange={e => handleInputChange('amount', e.target.value)} placeholder="0,00" className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-7" required />
            </div>
          </div>

          {formState.type === TransactionType.TRANSFER ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origem</label>
                  <select id="account" value={formState.accountId} onChange={e => handleInputChange('accountId', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    {visibleAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}{!a.isActive ? ' (Inativa)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="destinationAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destino</label>
                  <select id="destinationAccount" value={formState.destinationAccountId} onChange={e => handleInputChange('destinationAccountId', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                    {visibleAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}{!a.isActive ? ' (Inativa)' : ''}</option>)}
                  </select>
                </div>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select id="category" value={formState.categoryId} onChange={e => handleInputChange('categoryId', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                  {availableCategories.length > 0 ? (
                    availableCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)
                  ) : (
                    <option value="" disabled>Nenhuma categoria</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta</label>
                <select id="account" value={formState.accountId} onChange={e => handleInputChange('accountId', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                  {visibleAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}{!a.isActive ? ' (Inativa)' : ''}</option>)}
                </select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                <input type="date" id="date" value={formState.date} onChange={e => handleInputChange('date', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                  <input type="time" id="time" value={formState.time} onChange={e => handleInputChange('time', e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
              </div>
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