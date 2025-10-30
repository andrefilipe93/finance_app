
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { analyzeExpenses } from '../../services/geminiService';
import { TrashIcon, PencilIcon } from '../icons';
import { Category, Account, TransactionType } from '../../types';

// Modal para Adicionar/Editar Categoria
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categoryToEdit }) => {
  const { addCategory, updateCategory } = useAppContext();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [color, setColor] = useState('#ff6384');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setIcon(categoryToEdit.icon);
      setType(categoryToEdit.type);
      setColor(categoryToEdit.color);
    } else {
      setName('');
      setIcon('💰');
      setType(TransactionType.EXPENSE);
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
      setColor(randomColor);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') return;
    const categoryData = { name, icon, type, color };
    if (categoryToEdit) {
      updateCategory({ ...categoryData, id: categoryToEdit.id });
    } else {
      addCategory(categoryData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-4">{categoryToEdit ? 'Editar' : 'Nova'} Categoria</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input type="text" id="category-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ícone</label>
              <input type="text" id="category-icon" value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} className="mt-1 w-full text-center p-2 text-2xl bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="category-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
              <input type="color" id="category-color" value={color} onChange={e => setColor(e.target.value)} className="mt-1 w-full h-12 p-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-pointer" />
            </div>
            <div className="flex justify-center items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full" style={{ backgroundColor: color }}>
                <span className="text-3xl">{icon}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full px-4 py-2 rounded-l-md transition ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full px-4 py-2 rounded-r-md transition ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para Adicionar/Editar Conta
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit: Account | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, accountToEdit }) => {
  const { addAccount, updateAccount } = useAppContext();
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [type, setType] = useState('Carteira');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const accountTypes = ['Carteira', 'Conta Corrente', 'Poupança', 'Investimentos', 'Outro'];

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setInitialBalance(String(accountToEdit.initialBalance));
      setType(accountToEdit.type);
      setStartDate(accountToEdit.startDate);
    } else {
      setName('');
      setInitialBalance('');
      setType('Carteira');
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || initialBalance === '') return;
    const accountData = {
      name,
      initialBalance: parseFloat(initialBalance.replace(',', '.')),
      type,
      startDate,
    };
    if (accountToEdit) {
      updateAccount({ ...accountData, id: accountToEdit.id });
    } else {
      addAccount(accountData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-4">{accountToEdit ? 'Editar' : 'Nova'} Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Conta</label>
            <input type="text" id="account-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Conta</label>
            <select id="account-type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
              {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account-balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Inicial</label>
              <input type="text" inputMode="decimal" step="0.01" id="account-balance" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="0,00" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="account-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
              <input type="date" id="account-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const SettingsView: React.FC = () => {
  const { categories, deleteCategory, accounts, addAccount, updateAccount, deleteAccount, transactions } = useAppContext();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const openCategoryModal = (category?: Category) => {
    setCategoryToEdit(category || null);
    setIsCategoryModalOpen(true);
  };
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
  };

  const openAccountModal = (account?: Account) => {
    setAccountToEdit(account || null);
    setIsAccountModalOpen(true);
  };
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setAccountToEdit(null);
  };

  const handleGetAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setAiAnalysis('');
    try {
      if (transactions.length < 5) {
          setError("Adicione pelo menos 5 transações para obter uma análise.");
          return;
      }
      const result = await analyzeExpenses(transactions, categories);
      setAiAnalysis(result);
    } catch (e) {
      setError('Ocorreu um erro ao obter a análise. Tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Configurações</h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Análise com IA</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Obtenha dicas personalizadas e insights sobre seus gastos com o poder da IA do Gemini.
          </p>
          <button
            onClick={handleGetAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analisando...' : 'Analisar Minhas Despesas'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {aiAnalysis && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {aiAnalysis}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categorias</h2>
              <button onClick={() => openCategoryModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Adicionar Categoria
              </button>
            </div>
            
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map(c => {
                  const transactionCount = transactions.filter(t => t.categoryId === c.id).length;
                  return (
                    <li key={c.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center gap-3">
                          <span style={{ backgroundColor: c.color }} className="w-8 h-8 rounded-full flex items-center justify-center text-xl shrink-0">{c.icon}</span>
                          <div className="flex flex-col">
                              <span>{c.name}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full self-start ${c.type === TransactionType.INCOME ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                  {c.type === 'income' ? 'Receita' : 'Despesa'}
                              </span>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-medium px-2 py-0.5 rounded-full">
                          {transactionCount} {transactionCount === 1 ? 'mov.' : 'movs.'}
                        </span>
                        <button onClick={() => openCategoryModal(c)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => deleteCategory(c.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </li>
                  )
              })}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contas</h2>
                  <button onClick={() => openAccountModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Adicionar Conta
                  </button>
            </div>
            <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {accounts.map(a => {
                  const accountTransactions = transactions.filter(t => t.accountId === a.id);
                  const currentBalance = accountTransactions.reduce((balance, t) => {
                      return t.type === TransactionType.INCOME ? balance + t.amount : balance - t.amount;
                  }, a.initialBalance);
                  const transactionCount = accountTransactions.length;
                  const formattedStartDate = new Date(a.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                  return (
                      <li key={a.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-base">{a.name}</p>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                  {a.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => openAccountModal(a)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                               <button onClick={() => deleteAccount(a.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Saldo Inicial:</p>
                                <p className="font-semibold">{a.initialBalance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Saldo Atual:</p>
                                <p className={`font-semibold ${currentBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currentBalance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Data Início:</p>
                                <p className="font-semibold">{formattedStartDate}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Movimentos:</p>
                                <p className="font-semibold">{transactionCount}</p>
                            </div>
                        </div>
                      </li>
                  )
              })}
            </ul>
          </div>
        </div>
      </div>
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={closeCategoryModal} 
        categoryToEdit={categoryToEdit} 
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={closeAccountModal}
        accountToEdit={accountToEdit}
      />
    </>
  );
};

export default SettingsView;