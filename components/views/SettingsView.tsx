
import * as React from 'react';
import { useAppContext } from '../../context/AppContext';
import { analyzeExpenses } from '../../services/geminiService';
import { TrashIcon, PencilIcon, ArrowLeftIcon, ChevronRightIcon, CalendarIcon, RefreshIcon, SparklesIcon, TagIcon, WalletIcon, DatabaseIcon, DownloadIcon, UploadIcon, DashboardIcon, EyeIcon, EyeOffIcon, SettingsIcon } from '../icons';
import { Category, Account, TransactionType, CycleSettings, MonthlyStartType, RecurringTransaction, Transaction, ChartSettings } from '../../types';
import { ACCOUNT_ICON_MAP } from '../../constants';
import TransactionDetailModal from '../TransactionDetailModal';

// region Sub-components
// =================================================================================================
// NOTE: All sub-components are defined here at the top level of the file, outside the main 
// SettingsView component. This is a critical performance optimization to prevent them from being
// recreated on every render.
// =================================================================================================

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
};

const getNextDate = (current: Date, frequency: RecurringTransaction['frequency']): Date => {
    const next = new Date(current);
    next.setHours(12, 0, 0, 0); // Avoid timezone issues
    switch (frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}


// Modal para Adicionar/Editar Categoria
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, categoryToEdit }) => {
  const { addCategory, updateCategory } = useAppContext();

  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('💰');
  const [type, setType] = React.useState<TransactionType>(TransactionType.EXPENSE);
  const [color, setColor] = React.useState('#ff6384');

  React.useEffect(() => {
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
  const [name, setName] = React.useState('');
  const [initialBalance, setInitialBalance] = React.useState('');
  const [type, setType] = React.useState('Carteira');
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const accountTypes = Object.keys(ACCOUNT_ICON_MAP);

  React.useEffect(() => {
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
    const parsedBalance = parseFloat(initialBalance.replace(',', '.'));

    if (name.trim() === '') {
        alert("O nome da conta não pode estar vazio.");
        return;
    }
    if (isNaN(parsedBalance)) {
        alert("Por favor, insira um saldo inicial numérico válido.");
        return;
    }

    const accountData = {
      name,
      initialBalance: parsedBalance,
      type,
      startDate,
      icon: ACCOUNT_ICON_MAP[type] || '💰',
    };
    if (accountToEdit) {
      updateAccount({ ...accountToEdit, ...accountData });
    } else {
      addAccount({ ...accountData, isActive: true });
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
    const [formData, setFormData] = React.useState<Omit<RecurringTransaction, 'id' | 'lastGeneratedDate'>>({
        description: '',
        amount: 0,
        type: TransactionType.EXPENSE,
        accountId: '',
        categoryId: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isVariable: false,
        isActive: true,
    });
    
    React.useEffect(() => {
        const activeAccounts = accounts.filter(a => a.isActive);
        const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
        if (recurringToEdit) {
            setFormData({ ...recurringToEdit, amount: recurringToEdit.amount, endDate: recurringToEdit.endDate || '' });
        } else {
            setFormData({
                description: '',
                amount: 0,
                type: TransactionType.EXPENSE,
                accountId: activeAccounts[0]?.id || '',
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
        
        const parsedAmount = parseFloat(String(formData.amount).replace(',', '.'));

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Por favor, insira um valor numérico válido e positivo.");
            return;
        }
        
        const { description, categoryId, accountId } = formData;
        if (!description || !categoryId || !accountId) {
            alert("Por favor, preencha a descrição, categoria e conta.");
            return;
        }

        const dataToSave = { ...formData, amount: parsedAmount, endDate: formData.endDate || undefined };
        if (recurringToEdit) {
            updateRecurringTransaction({ ...recurringToEdit, ...dataToSave });
        } else {
            addRecurringTransaction(dataToSave);
        }
        onClose();
    };

    if (!isOpen) return null;

    const availableCategories = categories.filter(c => c.type === formData.type);
    const activeAccounts = accounts.filter(a => a.isActive);

    const commonSelectClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 text-base";
    const commonInputClasses = "mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 text-base";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all">
            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto pr-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{recurringToEdit ? 'Editar' : 'Novo'} Movimento Recorrente</h2>
                   <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
                </div>
                <div className="my-8 space-y-6">
                    <div>
                        <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de movimento</label>
                        <div className="flex rounded-md shadow-sm">
                          <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-full px-4 py-3 text-lg font-semibold rounded-l-md transition ${formData.type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
                          <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-full px-4 py-3 text-lg font-semibold rounded-r-md transition ${formData.type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Receita</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Valor</label>
                         <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"><span className="text-gray-500 sm:text-lg">€</span></div>
                            <input type="text" inputMode="decimal" name="amount" value={String(formData.amount).replace('.',',')} onChange={handleChange} placeholder="0,00" className="block w-full bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm pl-10 pr-4 py-3 text-2xl text-center font-bold" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className={commonInputClasses} placeholder="Ex: Renda, Eletricidade..." required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className={commonSelectClasses} required>
                              {availableCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Conta</label>
                            <select name="accountId" value={formData.accountId} onChange={handleChange} className={commonSelectClasses} required>
                              {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Frequência</label>
                        <select name="frequency" value={formData.frequency} onChange={handleChange} className={commonSelectClasses}>
                            <option value="daily">Diária</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                            <option value="yearly">Anual</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Início</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={commonInputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Fim (opcional)</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={commonInputClasses} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isVariable" name="isVariable" checked={formData.isVariable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="isVariable" className="text-sm font-medium text-gray-800 dark:text-gray-200">O valor pode variar</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-800 dark:text-gray-200">Ativa</label>
                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </div>
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

const ToggleButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'middle';
}> = ({ active, onClick, children, position }) => {
    const baseClasses = "w-full px-4 py-2 transition duration-200 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
    const activeClasses = "bg-blue-600 text-white shadow-sm";
    const inactiveClasses = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";
    
    let roundedClasses = '';
    if (position === 'left') roundedClasses = 'rounded-l-lg';
    else if (position === 'right') roundedClasses = 'rounded-r-lg';
    else if (!position) roundedClasses = 'rounded-lg';

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${roundedClasses}`}>
            {children}
        </button>
    )
};

// Componente para Configuração do Ciclo
const CycleSettingsComponent: React.FC = () => {
    const { cycleSettings, updateCycleSettings } = useAppContext();
    const [settings, setSettings] = React.useState<CycleSettings>(cycleSettings);
    const [isSaved, setIsSaved] = React.useState(false);

    React.useEffect(() => {
        setSettings(cycleSettings);
    }, [cycleSettings]);

    const handleSave = () => {
        updateCycleSettings(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleFrequencyChange = (newFrequency: 'monthly' | 'weekly') => {
        if (newFrequency === settings.frequency) return;
        
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
    
    const handleMonthlyTypeChange = (newType: 'fixed' | 'weekday') => {
        const isCurrentlyFixed = settings.monthlyStartType === 'fixed';
        if ((newType === 'fixed' && isCurrentlyFixed) || (newType === 'weekday' && !isCurrentlyFixed)) return;

        if (newType === 'fixed') {
            setSettings(prev => ({
                ...prev,
                monthlyStartType: 'fixed',
                startDay: 1
            }));
        } else { // weekday
             setSettings(prev => ({
                ...prev,
                monthlyStartType: 'first_weekday', // Default to first weekday
                startDay: 1 // Default to Monday
            }));
        }
    };
    
    const handleSettingsChange = <K extends keyof CycleSettings>(key: K, value: CycleSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const daysOfMonth = Array.from({ length: 28 }, (_, i) => i + 1);
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const occurrences = [{value: 'first_weekday', label: 'Primeiro(a)'}, {value: 'last_weekday', label: 'Último(a)'}];

    const summaryText = React.useMemo(() => {
        const { frequency, startDay, monthlyStartType } = settings;
        if (frequency === 'weekly') {
            return `O seu ciclo semanal começa toda ${daysOfWeek[startDay]}.`;
        }
        if (monthlyStartType === 'fixed') {
            return `O seu ciclo mensal começa no dia ${startDay} de cada mês.`;
        }
        const occurrenceText = monthlyStartType === 'first_weekday' ? 'primeira' : 'última';
        return `O seu ciclo mensal começa na ${occurrenceText} ${daysOfWeek[startDay]} de cada mês.`;
    }, [settings]);
    

    return (
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Defina o período para análise das suas finanças no dashboard.
            </p>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequência</label>
                    <div className="flex">
                        <ToggleButton active={settings.frequency === 'monthly'} onClick={() => handleFrequencyChange('monthly')} position="left">Mensal</ToggleButton>
                        <ToggleButton active={settings.frequency === 'weekly'} onClick={() => handleFrequencyChange('weekly')} position="right">Semanal</ToggleButton>
                    </div>
                </div>
                
                {settings.frequency === 'monthly' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4 border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de início do mês</label>
                         <div className="flex">
                           <ToggleButton active={settings.monthlyStartType === 'fixed'} onClick={() => handleMonthlyTypeChange('fixed')} position="left">Data Fixa</ToggleButton>
                           <ToggleButton active={settings.monthlyStartType !== 'fixed'} onClick={() => handleMonthlyTypeChange('weekday')} position="right">Dia da Semana</ToggleButton>
                        </div>

                        {settings.monthlyStartType === 'fixed' ? (
                            <div>
                                <label htmlFor="cycle-start-day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dia de Início</label>
                                <select id="cycle-start-day" value={settings.startDay} onChange={e => handleSettingsChange('startDay', parseInt(e.target.value))} className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    {daysOfMonth.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cycle-occurrence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ocorrência</label>
                                    <select id="cycle-occurrence" value={settings.monthlyStartType} onChange={e => handleSettingsChange('monthlyStartType', e.target.value as MonthlyStartType)} className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                        {occurrences.map(occ => <option key={occ.value} value={occ.value}>{occ.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="cycle-weekday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dia da Semana</label>
                                    <select id="cycle-weekday" value={settings.startDay} onChange={e => handleSettingsChange('startDay', parseInt(e.target.value))} className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                        {daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {settings.frequency === 'weekly' && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label htmlFor="cycle-start-weekday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dia de Início da Semana</label>
                        <select id="cycle-start-weekday" value={settings.startDay} onChange={e => handleSettingsChange('startDay', parseInt(e.target.value))} className="block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                            {daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center font-medium">{summaryText}</p>
            </div>
            
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ease-in-out ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isSaved ? 'Guardado!' : 'Guardar'}
                </button>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
        <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
    </div>
);

interface CategoryDetailProps {
    categoryId: string;
    onBack: () => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ categoryId, onBack }) => {
    const { categories, transactions, deleteCategory, categoryAverages } = useAppContext();
    const [isCategoryModalOpen, setCategoryModalOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<(Transaction & { runningBalance?: number }) | null>(null);

    const category = React.useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);

    const categoryTransactions = React.useMemo(() => {
        if (!category) return [];
        return transactions
            .filter(t => t.categoryId === categoryId)
            .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
    }, [transactions, categoryId, category]);

    const stats = React.useMemo(() => {
        if (!category) return { totalAmount: 0, transactionCount: 0, averageValue: 0, monthlyAverage: 0 };

        const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = categoryTransactions.length;
        const averageValue = transactionCount > 0 ? totalAmount / transactionCount : 0;
        const monthlyAverage = categoryAverages.get(categoryId) || 0;

        return { totalAmount, transactionCount, averageValue, monthlyAverage };
    }, [category, categoryTransactions, categoryAverages, categoryId]);

    const handleDelete = () => {
        if (category) {
            if (transactions.some(t => t.categoryId === category.id)) {
                alert("Não é possível eliminar categorias com transações associadas.");
                return;
            }
            if (window.confirm(`Tem a certeza que deseja eliminar a categoria "${category.name}"?`)) {
                deleteCategory(category.id);
            }
        }
    };
    
    React.useEffect(() => {
        const categoryExists = categories.some(c => c.id === categoryId);
        if (!categoryExists) {
            onBack();
        }
    }, [categories, categoryId, onBack]);

    if (!category) {
        return null; 
    }

    const typeText = category.type === TransactionType.EXPENSE ? 'Despesa' : 'Receita';
    const totalTitle = category.type === TransactionType.EXPENSE ? 'Total Gasto' : 'Total Recebido';

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Todas as Categorias</span>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${category.type === TransactionType.EXPENSE ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                            {typeText}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    <button onClick={() => setCategoryModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"><PencilIcon className="w-4 h-4" /> Editar</button>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800"><TrashIcon className="w-4 h-4" /> Eliminar</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title={totalTitle} value={formatCurrency(stats.totalAmount)} />
                <StatCard title="Nº de Movimentos" value={stats.transactionCount.toString()} />
                <StatCard title="Valor Médio" value={formatCurrency(stats.averageValue)} />
                <StatCard title="Média Mensal (6m)" value={formatCurrency(stats.monthlyAverage)} />
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Histórico de Movimentos</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto">
                    {categoryTransactions.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {categoryTransactions.map(t => (
                                <li key={t.id} onClick={() => setSelectedTransaction(t)} className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="font-semibold">{t.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' })}</p>
                                    </div>
                                    <p className={`font-bold ${t.type === TransactionType.EXPENSE ? 'text-red-500' : 'text-green-500'}`}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 p-8">Nenhum movimento encontrado para esta categoria.</p>
                    )}
                </div>
            </div>

            <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} categoryToEdit={category} />
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </div>
    );
};

interface CategoryListItemProps {
    category: Category;
    transactionCount: number;
    onSelect: (id: string) => void;
}
  
const CategoryListItem: React.FC<CategoryListItemProps> = ({ category, transactionCount, onSelect }) => {
    return (
        <li onClick={() => onSelect(category.id)} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
            <div className="flex items-center gap-3 flex-grow">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-grow">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {transactionCount} {transactionCount === 1 ? 'movimento' : 'movimentos'}
                    </p>
                </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 pl-2" />
        </li>
    );
};


// Componente para Gerir Categorias
const CategoriesManager: React.FC = () => {
    const { categories, transactions } = useAppContext();
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

    const transactionCounts = React.useMemo(() => {
        const counts = new Map<string, number>();
        transactions.forEach(t => {
            if (t.categoryId) {
                counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
            }
        });
        return counts;
    }, [transactions]);


    if (selectedCategoryId) {
        return <CategoryDetail categoryId={selectedCategoryId} onBack={() => setSelectedCategoryId(null)} />;
    }
    
    const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
    const incomeCategories = categories.filter(c => c.type === TransactionType.INCOME);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">Nova Categoria</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2">Despesas</h3>
                    <ul className="space-y-2">
                        {expenseCategories.map(c => (
                            <CategoryListItem 
                                key={c.id} 
                                category={c} 
                                transactionCount={transactionCounts.get(c.id) || 0}
                                onSelect={setSelectedCategoryId} 
                            />
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Receitas</h3>
                    <ul className="space-y-2">
                        {incomeCategories.map(c => (
                            <CategoryListItem 
                                key={c.id} 
                                category={c} 
                                transactionCount={transactionCounts.get(c.id) || 0}
                                onSelect={setSelectedCategoryId} 
                            />
                        ))}
                    </ul>
                </div>
            </div>
            <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categoryToEdit={null} />
        </>
    );
};


interface AccountDetailProps {
    accountId: string;
    onBack: () => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({ accountId, onBack }) => {
    const { accounts, transactions, categories, deleteAccount, accountDetails } = useAppContext();
    const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<(Transaction & { runningBalance?: number }) | null>(null);

    const account = React.useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);

    const accountTransactions = React.useMemo(() => {
        if (!account) return [];
        return transactions
            .filter(t => t.accountId === accountId || t.destinationAccountId === accountId)
            .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
    }, [transactions, accountId, account]);

    const stats = React.useMemo(() => {
        if (!account) return { currentBalance: 0, inflow: 0, outflow: 0, net: 0 };
        
        const details = accountDetails.get(accountId);
        const currentBalance = details ? details.currentBalance : account.initialBalance;
        
        let inflow = 0;
        let outflow = 0;
        
        transactions.forEach(t => {
            if (t.accountId === accountId) {
                if (t.type === TransactionType.INCOME) inflow += t.amount;
                else outflow += t.amount; // Expense or Transfer out
            } else if (t.type === TransactionType.TRANSFER && t.destinationAccountId === accountId) {
                inflow += t.amount;
            }
        });
        
        return { currentBalance, inflow, outflow, net: inflow - outflow };

    }, [account, accountDetails, accountId, transactions]);

    const handleDelete = () => {
        if (account) {
            deleteAccount(account.id);
        }
    };
    
    React.useEffect(() => {
        const accountExists = accounts.some(a => a.id === accountId);
        if (!accountExists) {
            onBack();
        }
    }, [accounts, accountId, onBack]);

    if (!account) {
        return null; 
    }

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Todas as Contas</span>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{account.icon}</span>
                    <div>
                        <h2 className="text-2xl font-bold">{account.name}</h2>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                            {account.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                    <button onClick={() => setAccountModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"><PencilIcon className="w-4 h-4" /> Editar</button>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800"><TrashIcon className="w-4 h-4" /> {account.isActive ? 'Inativar' : 'Reativar'}</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Saldo Atual" value={formatCurrency(stats.currentBalance)} />
                <StatCard title="Saldo Inicial" value={formatCurrency(account.initialBalance)} />
                <StatCard title="Data de Registo" value={new Date(account.startDate).toLocaleDateString('pt-PT', { timeZone: 'UTC' })} />
                <StatCard title="Total Entradas" value={formatCurrency(stats.inflow)} />
                <StatCard title="Total Saídas" value={formatCurrency(stats.outflow)} />
                <StatCard title="Movimento Líquido" value={formatCurrency(stats.net)} />
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Histórico de Movimentos</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto">
                    {accountTransactions.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {accountTransactions.map(t => {
                                const isOut = (t.type === TransactionType.EXPENSE || (t.type === TransactionType.TRANSFER && t.accountId === accountId));
                                const amountSign = isOut ? '-' : '+';
                                const amountText = `${t.type === TransactionType.TRANSFER ? '' : amountSign} ${formatCurrency(t.amount)}`;

                                let detailText = '';
                                if (t.type === TransactionType.TRANSFER) {
                                    if (isOut) {
                                        const destAcc = accounts.find(a => a.id === t.destinationAccountId);
                                        detailText = `Para: ${destAcc?.name || 'N/A'}`;
                                    } else {
                                        const sourceAcc = accounts.find(a => a.id === t.accountId);
                                        detailText = `De: ${sourceAcc?.name || 'N/A'}`;
                                    }
                                } else {
                                    const category = categories.find(c => c.id === t.categoryId);
                                    detailText = category?.name || 'Sem Categoria';
                                }

                                return (
                                    <li key={t.id} onClick={() => setSelectedTransaction(t)} className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <div>
                                            <p className="font-semibold">{t.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' })} &bull; {detailText}</p>
                                        </div>
                                        <p className={`font-bold ${isOut ? 'text-red-500' : 'text-green-500'}`}>{amountText}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 p-8">Nenhum movimento encontrado para esta conta.</p>
                    )}
                </div>
            </div>

            <AccountModal isOpen={isAccountModalOpen} onClose={() => setAccountModalOpen(false)} accountToEdit={account} />
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </div>
    );
};

interface AccountListItemProps {
  account: Account;
  onSelect: (id: string) => void;
}

const AccountListItem: React.FC<AccountListItemProps> = ({ account, onSelect }) => {
    const { accountDetails } = useAppContext();
    const details = accountDetails.get(account.id);
    const balance = details ? details.currentBalance : account.initialBalance;
    const transactionCount = details ? details.transactionCount : 0;

    return (
        <li onClick={() => onSelect(account.id)} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
            <div className="flex items-center gap-3 flex-grow">
                <span className="text-2xl">{account.icon}</span>
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{account.name}</p>
                        <p className="font-semibold text-sm">{formatCurrency(balance)}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{account.type}</span>
                        <span>{transactionCount} {transactionCount === 1 ? 'movimento' : 'movimentos'}</span>
                    </div>
                </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 pl-2" />
        </li>
    );
};


// Componente para Gerir Contas
const AccountsManager: React.FC = () => {
    const { accounts } = useAppContext();
    const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);
    const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null);

    if (selectedAccountId) {
        return <AccountDetail accountId={selectedAccountId} onBack={() => setSelectedAccountId(null)} />;
    }

    const activeAccounts = accounts.filter(a => a.isActive);
    const inactiveAccounts = accounts.filter(a => !a.isActive);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setAccountModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">Nova Conta</button>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Contas Ativas</h3>
                <ul className="space-y-2">
                    {activeAccounts.map(acc => <AccountListItem key={acc.id} account={acc} onSelect={setSelectedAccountId} />)}
                </ul>
            </div>
            {inactiveAccounts.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Contas Inativas</h3>
                    <ul className="space-y-2">
                        {inactiveAccounts.map(acc => <AccountListItem key={acc.id} account={acc} onSelect={setSelectedAccountId} />)}
                    </ul>
                </div>
            )}
            <AccountModal isOpen={isAccountModalOpen} onClose={() => setAccountModalOpen(false)} accountToEdit={null} />
        </>
    );
};

// Componente para Gerir Movimentos Recorrentes
const RecurringManager: React.FC = () => {
    const { recurringTransactions, deleteRecurringTransaction, transactions } = useAppContext();
    const [isRecurringModalOpen, setRecurringModalOpen] = React.useState(false);
    const [recurringToEdit, setRecurringToEdit] = React.useState<RecurringTransaction | null>(null);
    const [generatedTransactions, setGeneratedTransactions] = React.useState<Transaction[] | null>(null);
    const [selectedTransaction, setSelectedTransaction] = React.useState<(Transaction & { runningBalance: number }) | null>(null);

    const openModal = (recurring: RecurringTransaction | null = null) => {
        setRecurringToEdit(recurring);
        setRecurringModalOpen(true);
    };

    const viewGenerated = (recurringId: string) => {
        const generated = transactions.filter(t => t.recurringTransactionId === recurringId)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setGeneratedTransactions(generated);
    };
    
    const freqMap: Record<string, string> = { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">Novo Recorrente</button>
            </div>
            <ul className="space-y-3">
                {recurringTransactions.map(r => {
                    const nextDate = r.lastGeneratedDate ? getNextDate(new Date(r.lastGeneratedDate), r.frequency) : new Date(r.startDate);
                    const endDate = r.endDate ? new Date(r.endDate) : null;
                    const isFinished = endDate && today > endDate;
                    return (
                        <li key={r.id} className={`p-3 rounded-lg flex justify-between items-center ${!r.isActive || isFinished ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                            <div>
                                <p className="font-semibold">{r.description} ({formatCurrency(r.amount)})</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {freqMap[r.frequency]}. Próximo: {isFinished ? 'Terminado' : nextDate.toLocaleDateString('pt-PT')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => viewGenerated(r.id)} className="p-2 text-gray-500 hover:text-green-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title="Ver gerados"><EyeIcon className="w-5 h-5"/></button>
                                <button onClick={() => openModal(r)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => deleteRecurringTransaction(r.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </li>
                    )
                })}
            </ul>
             <RecurringTransactionModal isOpen={isRecurringModalOpen} onClose={() => setRecurringModalOpen(false)} recurringToEdit={recurringToEdit} />
             {generatedTransactions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">Movimentos Gerados</h3>
                        <ul className="space-y-2 max-h-80 overflow-y-auto">
                            {generatedTransactions.map(t => (
                                <li key={t.id} className="text-sm flex justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md" onClick={() => setSelectedTransaction({ ...t, runningBalance: 0})}>
                                    <span>{new Date(t.date).toLocaleDateString('pt-PT')} - {t.description}</span>
                                    <span>{formatCurrency(t.amount)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setGeneratedTransactions(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
             <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

// Componente para Análise com IA
const AIAnalysis: React.FC = () => {
    const { cycleTransactions, categories } = useAppContext();
    const [analysis, setAnalysis] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string>('');

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const expenseTransactions = cycleTransactions.filter(t => t.type === TransactionType.EXPENSE);
            if (expenseTransactions.length === 0) {
                setError("Não existem despesas no ciclo atual para analisar.");
                return;
            }
            const result = await analyzeExpenses(expenseTransactions, categories);
            setAnalysis(result);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Obtenha dicas personalizadas para otimizar as suas finanças com base nos seus gastos do ciclo atual.
            </p>
            <button onClick={handleAnalyze} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                <SparklesIcon />
                <span>{isLoading ? 'A analisar...' : 'Analisar Despesas'}</span>
            </button>
            {analysis && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 whitespace-pre-wrap font-sans">
                    {analysis}
                </div>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
    );
};

// Componente para personalizar dashboard
const DashboardCustomization: React.FC = () => {
    const { chartSettings, updateChartSettings } = useAppContext();
    
    const toggleChart = (chart: keyof ChartSettings) => {
        updateChartSettings({ ...chartSettings, [chart]: !chartSettings[chart] });
    };

    return (
        <div>
             <p className="text-gray-600 dark:text-gray-400 mb-4">
                Escolha quais os gráficos que pretende ver no seu dashboard.
            </p>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label htmlFor="expensesByCategory">Despesas por Categoria</label>
                    <input type="checkbox" id="expensesByCategory" checked={chartSettings.expensesByCategory} onChange={() => toggleChart('expensesByCategory')} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label htmlFor="incomeByCategory">Receitas por Categoria</label>
                    <input type="checkbox" id="incomeByCategory" checked={chartSettings.incomeByCategory} onChange={() => toggleChart('incomeByCategory')} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label htmlFor="expenseEvolution">Evolução das Despesas</label>
                    <input type="checkbox" id="expenseEvolution" checked={chartSettings.expenseEvolution} onChange={() => toggleChart('expenseEvolution')} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label htmlFor="dailyMovements">Movimentos Diários</label>
                    <input type="checkbox" id="dailyMovements" checked={chartSettings.dailyMovements} onChange={() => toggleChart('dailyMovements')} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
            </div>
        </div>
    );
};

// Componente para Gestão de Dados (Importar/Exportar)
const DataManagement: React.FC = () => {
    const { transactions, categories, accounts, cycleSettings, recurringTransactions, budgets, importData, chartSettings } = useAppContext();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataToExport = {
            transactions,
            categories,
            accounts,
            cycleSettings,
            recurringTransactions,
            budgets,
            chartSettings,
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `gestorapp_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("A importação irá substituir todos os dados atuais. Deseja continuar?")) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                const { success, message } = importData(data);
                alert(message);
                if (success) {
                    window.location.reload();
                }
            } catch (error) {
                alert("Erro ao ler o ficheiro de backup. Certifique-se que o ficheiro é válido.");
                console.error(error);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleExport} className="flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    <DownloadIcon />
                    <span>Exportar Backup</span>
                </button>
                <button onClick={handleImportClick} className="flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                    <UploadIcon />
                    <span>Importar Backup</span>
                </button>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
        </div>
    );
};

const AppearanceSettings: React.FC = () => {
    const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    });

    const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
        localStorage.setItem('theme', selectedTheme);
        setTheme(selectedTheme);

        if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (selectedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else { // system
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escolha como a aplicação deve ser apresentada. A opção "Sistema" irá seguir a configuração do seu dispositivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => applyTheme('light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left ${theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                >
                    <div className="font-bold">☀️ Claro</div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Um tema claro e tradicional.</p>
                </button>
                <button
                    onClick={() => applyTheme('dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left ${theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                >
                    <div className="font-bold">🌙 Escuro</div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Um tema escuro para conforto visual.</p>
                </button>
                <button
                    onClick={() => applyTheme('system')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left ${theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                >
                    <div className="font-bold">🖥️ Sistema</div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Ajusta-se automaticamente.</p>
                </button>
            </div>
        </div>
    );
};

const PrivacySettings: React.FC = () => {
    const [hideOnStartup, setHideOnStartup] = React.useState(() => {
        return localStorage.getItem('hideValuesOnStartup') === 'true';
    });

    const handleToggle = () => {
        const newValue = !hideOnStartup;
        setHideOnStartup(newValue);
        localStorage.setItem('hideValuesOnStartup', String(newValue));
    };


    return (
        <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
                Ative esta opção para que os valores no cartão principal da página inicial apareçam ocultos por defeito ao abrir a aplicação.
            </p>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label htmlFor="value-masking-toggle" className="font-medium text-gray-800 dark:text-gray-200">
                    Ocultar valores por defeito na página inicial
                </label>
                <div 
                    onClick={handleToggle} 
                    className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${hideOnStartup ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${hideOnStartup ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </div>
                 <input type="checkbox" id="value-masking-toggle" checked={hideOnStartup} onChange={handleToggle} className="sr-only" />
            </div>
        </div>
    );
};

// Main Settings View
const SettingsView: React.FC = () => {
    type SettingsScreen = 'general' | 'categories' | 'accounts' | 'recurring' | 'dashboard' | 'data' | 'appearance' | 'privacy';
    const [activeScreen, setActiveScreen] = React.useState<SettingsScreen | null>(null);

    const navItems = [
      { id: 'general' as SettingsScreen, label: 'Geral', icon: <SettingsIcon />, description: 'Defina o ciclo financeiro para a sua análise.' },
      { id: 'categories' as SettingsScreen, label: 'Categorias', icon: <TagIcon />, description: 'Adicione, edite ou remova categorias de despesa e receita.' },
      { id: 'accounts' as SettingsScreen, label: 'Contas', icon: <WalletIcon />, description: 'Gira as suas contas bancárias, cartões e carteiras.' },
      { id: 'recurring' as SettingsScreen, label: 'Recorrentes', icon: <RefreshIcon />, description: 'Automatize o registo de movimentos frequentes.' },
      { id: 'dashboard' as SettingsScreen, label: 'Dashboard', icon: <DashboardIcon />, description: 'Personalize os gráficos que aparecem no ecrã inicial.' },
      { id: 'appearance' as SettingsScreen, label: 'Aparência', icon: <EyeIcon />, description: 'Personalize o tema da aplicação.' },
      { id: 'privacy' as SettingsScreen, label: 'Privacidade', icon: <EyeOffIcon />, description: 'Controle a visibilidade dos seus dados financeiros.' },
      { id: 'data' as SettingsScreen, label: 'Dados e IA', icon: <DatabaseIcon />, description: 'Faça backups e receba análises com IA.' },
    ];
    
    const renderContent = () => {
        switch (activeScreen) {
            case 'general':
                return <CycleSettingsComponent />;
            case 'categories':
                return <CategoriesManager />;
            case 'accounts':
                return <AccountsManager />;
            case 'recurring':
                return <RecurringManager />;
            case 'dashboard':
                return <DashboardCustomization />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'privacy':
                return <PrivacySettings />;
            case 'data':
                return (
                    <div className="space-y-8">
                        <AIAnalysis />
                        <hr className="dark:border-gray-700 my-8"/>
                        <DataManagement />
                    </div>
                );
            default:
                return null;
        }
    };
    
    if (activeScreen) {
        const currentItem = navItems.find(item => item.id === activeScreen);
        return (
            <div className="space-y-6">
                 <button onClick={() => setActiveScreen(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Voltar às Configurações</span>
                </button>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                   <h2 className="text-2xl font-bold mb-6">{currentItem?.label}</h2>
                   {renderContent()}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveScreen(item.id)}
                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-300">
                                        {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.label}</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default SettingsView;
