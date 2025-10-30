import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { analyzeExpenses } from '../../services/geminiService';
import { TrashIcon, PencilIcon } from '../icons';
import { Category, Account, TransactionType, CycleSettings, MonthlyStartType, RecurringTransaction } from '../../types';
import { ACCOUNT_ICON_MAP } from '../../constants';

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
  const accountTypes = Object.keys(ACCOUNT_ICON_MAP);

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
      icon: ACCOUNT_ICON_MAP[type] || '💰',
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
              {accountTypes.map(t => <option key={t} value={t}>{ACCOUNT_ICON_MAP[t]} {t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account-balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Inicial</label>
               <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                    </div>
                    <input type="text" inputMode="decimal" step="0.01" id="account-balance" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="0,00" className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-7" required />
               </div>
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


// Modal para Movimentos Recorrentes
interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringToEdit: RecurringTransaction | null;
}

const RecurringTransactionModal: React.FC<RecurringModalProps> = ({ isOpen, onClose, recurringToEdit }) => {
    const { categories, accounts, addRecurringTransaction, updateRecurringTransaction } = useAppContext();
    const [formData, setFormData] = useState<Omit<RecurringTransaction, 'id' | 'lastGeneratedDate'>>({
        description: '',
        amount: 0,
        type: TransactionType.EXPENSE,
        accountId: accounts[0]?.id || '',
        categoryId: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isVariable: false,
        isActive: true,
    });
    
    useEffect(() => {
        const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
        if (recurringToEdit) {
            setFormData({ ...recurringToEdit, amount: recurringToEdit.amount });
        } else {
            setFormData({
                description: '',
                amount: 0,
                type: TransactionType.EXPENSE,
                accountId: accounts[0]?.id || '',
                categoryId: expenseCategories[0]?.id || '',
                frequency: 'monthly',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                isVariable: false,
                isActive: true,
            });
        }
    }, [recurringToEdit, isOpen, categories, accounts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleTypeChange = (type: TransactionType.INCOME | TransactionType.EXPENSE) => {
        const relevantCategories = categories.filter(c => c.type === type);
        setFormData(prev => ({
            ...prev,
            type,
            categoryId: relevantCategories[0]?.id || ''
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { description, amount, categoryId, accountId } = formData;
        if (!description || !amount || !categoryId || !accountId) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const dataToSave = { ...formData, amount: parseFloat(String(formData.amount).replace(',', '.')) };
        if (recurringToEdit) {
            updateRecurringTransaction({ ...dataToSave, id: recurringToEdit.id });
        } else {
            addRecurringTransaction(dataToSave);
        }
        onClose();
    };

    if (!isOpen) return null;

    const availableCategories = categories.filter(c => c.type === formData.type);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all">
            <h2 className="text-2xl font-bold mb-4">{recurringToEdit ? 'Editar' : 'Novo'} Movimento Recorrente</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <div>
                    <div className="flex rounded-md shadow-sm">
                      <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full px-4 py-2 rounded-l-md transition ${formData.type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
                      <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full px-4 py-2 rounded-r-md transition ${formData.type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Título</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Valor</label>
                         <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">€</span></div>
                            <input type="text" inputMode="decimal" name="amount" value={formData.amount} onChange={handleChange} placeholder="0,00" className="block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm pl-7" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Frequência</label>
                        <select name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
                            <option value="daily">Diária</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                            <option value="yearly">Anual</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Categoria</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" required>
                          {availableCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Conta</label>
                        <select name="accountId" value={formData.accountId} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" required>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Data de Início</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Data de Fim (opcional)</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" />
                    </div>
                </div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isVariable" name="isVariable" checked={formData.isVariable} onChange={handleChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="isVariable" className="text-sm font-medium">O valor pode variar</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="isActive" className="text-sm font-medium">Ativa</label>
                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                </div>
            </form>
          </div>
        </div>
    );
};


// Componente para Configuração do Ciclo
const CycleSettingsComponent: React.FC = () => {
    const { cycleSettings, updateCycleSettings } = useAppContext();
    const [settings, setSettings] = useState<CycleSettings>(cycleSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setSettings(cycleSettings);
    }, [cycleSettings]);

    const handleSave = () => {
        updateCycleSettings(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFrequency = e.target.value as 'monthly' | 'weekly';
        if (newFrequency === 'monthly') {
            setSettings({
                frequency: 'monthly',
                monthlyStartType: 'fixed',
                startDay: 1
            });
        } else { // weekly
            setSettings({
                frequency: 'weekly',
                startDay: 1 // Default to Monday
            });
        }
    };

    const handleMonthlyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as MonthlyStartType;
        setSettings(prev => ({
            ...prev,
            monthlyStartType: newType,
            startDay: newType === 'fixed' ? 1 : 1 // Default to day 1 or Monday
        }));
    };

    const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({
            ...prev,
            startDay: parseInt(e.target.value)
        }));
    };
    
    const daysOfMonth = Array.from({length: 28}, (_, i) => i + 1);
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ciclo Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Defina o período para análise das suas finanças no dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="cycle-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequência</label>
                    <select 
                        id="cycle-frequency"
                        value={settings.frequency}
                        onChange={handleFrequencyChange}
                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="monthly">Mensal</option>
                        <option value="weekly">Semanal</option>
                    </select>
                </div>
                {settings.frequency === 'monthly' && (
                    <div className="md:col-span-1">
                        <label htmlFor="monthly-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Início</label>
                        <select
                            id="monthly-type"
                            value={settings.monthlyStartType}
                            onChange={handleMonthlyTypeChange}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                        >
                            <option value="fixed">Data Fixa</option>
                            <option value="first_weekday">Primeiro(a)</option>
                            <option value="last_weekday">Último(a)</option>
                        </select>
                    </div>
                )}
                 <div className="md:col-span-1">
                    <label htmlFor="cycle-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Início</label>
                    <select
                        id="cycle-start"
                        value={settings.startDay}
                        onChange={handleStartDayChange}
                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        {settings.frequency === 'weekly' || settings.monthlyStartType !== 'fixed'
                            ? daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)
                            : daysOfMonth.map(day => <option key={day} value={day}>Dia {day}</option>)
                        }
                    </select>
                </div>
                <div className="md:col-span-1">
                    <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                    >
                        {isSaved ? 'Salvo!' : 'Salvar Ciclo'}
                    </button>
                </div>
            </div>
        </div>
    );
}


const SettingsView: React.FC = () => {
  const { 
    categories, deleteCategory, 
    accounts, deleteAccount, 
    transactions, cycleTransactions,
    recurringTransactions, deleteRecurringTransaction, updateRecurringTransaction
  } = useAppContext();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringTransaction | null>(null);


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

  const openRecurringModal = (recurring?: RecurringTransaction) => {
    setRecurringToEdit(recurring || null);
    setIsRecurringModalOpen(true);
  };
  const closeRecurringModal = () => {
    setIsRecurringModalOpen(false);
    setRecurringToEdit(null);
  };

  const handleToggleRecurring = (rule: RecurringTransaction) => {
    updateRecurringTransaction({ ...rule, isActive: !rule.isActive });
  }

  const handleGetAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setAiAnalysis('');
    try {
      if (cycleTransactions.length < 3) {
          setError("Adicione pelo menos 3 transações no ciclo atual para obter uma análise.");
          return;
      }
      const result = await analyzeExpenses(cycleTransactions, categories);
      setAiAnalysis(result);
    } catch (e) {
      setError('Ocorreu um erro ao obter a análise. Tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const frequencyMap: {[key: string]: string} = {
    'daily': 'Diária',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'yearly': 'Anual',
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Configurações</h1>

        <CycleSettingsComponent />

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Movimentos Recorrentes</h2>
              <button onClick={() => openRecurringModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Adicionar Regra
              </button>
            </div>
            {recurringTransactions.length > 0 ? (
                <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {recurringTransactions.map(r => (
                    <li key={r.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full mt-1.5 ${r.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <div>
                                    <p className="font-bold text-base">{r.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {r.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} - {frequencyMap[r.frequency]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => openRecurringModal(r)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                               <button onClick={() => deleteRecurringTransaction(r.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </li>
                ))}
                </ul>
            ) : <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum movimento recorrente configurado.</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Análise com IA</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Obtenha dicas sobre seus gastos no ciclo atual com o poder da IA do Gemini.
          </p>
          <button
            onClick={handleGetAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analisando...' : 'Analisar Despesas do Ciclo'}
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
                  const currentBalance = transactions.reduce((balance, t) => {
                    if (t.accountId === a.id) { // Source account
                      if (t.type === TransactionType.INCOME) return balance + t.amount;
                      if (t.type === TransactionType.EXPENSE || t.type === TransactionType.TRANSFER) return balance - t.amount;
                    } else if (t.destinationAccountId === a.id && t.type === TransactionType.TRANSFER) { // Destination account
                      return balance + t.amount;
                    }
                    return balance;
                  }, a.initialBalance);
                  
                  const transactionCount = transactions.filter(t => t.accountId === a.id || t.destinationAccountId === a.id).length;
                  const formattedStartDate = new Date(a.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                  return (
                      <li key={a.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <span className="text-2xl">{a.icon}</span>
                                <div>
                                    <p className="font-bold text-base">{a.name}</p>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                      {a.type}
                                    </span>
                                </div>
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
      <RecurringTransactionModal
        isOpen={isRecurringModalOpen}
        onClose={closeRecurringModal}
        recurringToEdit={recurringToEdit}
       />
    </>
  );
};

export default SettingsView;