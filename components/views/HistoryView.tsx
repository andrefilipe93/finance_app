

import * as React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import TransactionDetailModal from '../TransactionDetailModal';
import FutureTransactionsModal from '../FutureTransactionsModal';
import { CalendarIcon, SearchIcon, XCircleIcon, PlusIcon } from '../icons';

const HistoryView: React.FC = () => {
  const { transactions, categories, accounts } = useAppContext();
  const [selectedTransaction, setSelectedTransaction] = React.useState<(Transaction & { runningBalance: number }) | null>(null);
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [visibleCount, setVisibleCount] = React.useState(10);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  };

  // Debounce search term
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  // Reset pagination when search term changes
  React.useEffect(() => {
      setVisibleCount(10);
  }, [debouncedSearchTerm]);

  const { allDisplayTransactions, pendingTransactions } = React.useMemo(() => {
    const lowerCaseSearch = debouncedSearchTerm.toLowerCase().trim();

    const filteredBySearch = lowerCaseSearch === ''
        ? transactions
        : transactions.filter(t => {
            const category = categories.find(c => c.id === t.categoryId);
            const account = accounts.find(a => a.id === t.accountId);
            const destinationAccount = accounts.find(a => a.id === t.destinationAccountId);

            return (
                t.description.toLowerCase().includes(lowerCaseSearch) ||
                t.amount.toString().replace('.',',').includes(lowerCaseSearch) ||
                (category && category.name.toLowerCase().includes(lowerCaseSearch)) ||
                (account && account.name.toLowerCase().includes(lowerCaseSearch)) ||
                (destinationAccount && destinationAccount.name.toLowerCase().includes(lowerCaseSearch))
            );
        });
    
    const todayString = new Date().toISOString().split('T')[0];
    const nowString = new Date().toTimeString().slice(0, 5);

    const pastAndPresentTransactions = filteredBySearch.filter(t => {
      if (t.date < todayString) return true;
      if (t.date === todayString && t.time <= nowString) return true;
      return false;
    });

    const pendingTrans = filteredBySearch.filter(t => {
       if (t.date > todayString) return true;
       if (t.date === todayString && t.time > nowString) return true;
       return false;
    });
    
    pendingTrans.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    const totalInitialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);

    const chronologicalTransactions = [...pastAndPresentTransactions].sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`);
        
        if (dateTimeA.getTime() !== dateTimeB.getTime()) {
            return dateTimeA.getTime() - dateTimeB.getTime();
        }
        
        return a.createdAt - b.createdAt;
    });

    let runningBalance = totalInitialBalance;
    const transactionsWithBalance = chronologicalTransactions.map(t => {
        if (t.type !== TransactionType.TRANSFER) {
            runningBalance += t.type === TransactionType.INCOME ? t.amount : -t.amount;
        }
        return { ...t, runningBalance };
    });

    const displayTransactions = transactionsWithBalance.reverse();

    return { allDisplayTransactions: displayTransactions, pendingTransactions: pendingTrans };
  }, [transactions, accounts, categories, debouncedSearchTerm]);
  
  const groupedTransactions = React.useMemo(() => {
    const visibleSlice = allDisplayTransactions.slice(0, visibleCount);
    
    const grouped = visibleSlice.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(t);
      return acc;
    }, {} as Record<string, (Transaction & { runningBalance: number })[]>);
    
    return grouped;
  }, [allDisplayTransactions, visibleCount]);

  const canLoadMore = visibleCount < allDisplayTransactions.length;

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + 10);
  };

  const handleTransactionClick = (transaction: Transaction & { runningBalance: number }) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };
  
  const handleClosePendingModal = () => {
    setIsPendingModalOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Histórico de Transações</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/80 pl-10 pr-10 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 transition"
                />
                {searchTerm && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            {pendingTransactions.length > 0 && (
                <button
                onClick={() => setIsPendingModalOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors flex-shrink-0"
                aria-label={`Ver ${pendingTransactions.length} movimentos pendentes`}
                >
                <CalendarIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Pendentes</span>
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {pendingTransactions.length}
                </span>
                </button>
            )}
          </div>
        </div>
        {Object.keys(groupedTransactions).length > 0 ? (
          <div className="space-y-6">
            {Object.keys(groupedTransactions).map((date) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">{date}</h2>
                <ul className="space-y-3">
                  {groupedTransactions[date].map(t => {
                    const category = categories.find(c => c.id === t.categoryId);
                    const account = accounts.find(a => a.id === t.accountId);
                    const destinationAccount = accounts.find(a => a.id === t.destinationAccountId);
                    const isExpense = t.type === TransactionType.EXPENSE;
                    const isTransfer = t.type === TransactionType.TRANSFER;
                    return (
                      <li 
                        key={t.id} 
                        onClick={() => handleTransactionClick(t)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-y-2 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-150 cursor-pointer"
                      >
                        <div 
                          className="flex items-center space-x-4 flex-grow min-w-[200px]"
                        >
                          <div className="text-2xl">{isTransfer ? '🔄' : category?.icon || '💸'}</div>
                          <div>
                            <p className="font-semibold">{t.description}</p>
                            {isTransfer ? (
                               <p className="text-sm text-gray-500 dark:text-gray-400">{account?.name} → {destinationAccount?.name}</p>
                            ) : (
                               <p className="text-sm text-gray-500 dark:text-gray-400">{account?.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isExpense ? 'text-red-500' : isTransfer ? 'text-gray-700 dark:text-gray-200' : 'text-green-500'}`}>
                          {isExpense ? '-' : isTransfer ? '' : '+'} {formatCurrency(t.amount)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(t.runningBalance)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
            {canLoadMore && (
                <div className="text-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        className="flex items-center gap-2 mx-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Carregar mais 10</span>
                    </button>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma transação encontrada.'}
              </h2>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                {searchTerm ? 'Tente pesquisar por outros termos.' : "Clique no botão '+' para adicionar uma nova transação."}
              </p>
          </div>
        )}
      </div>
      <TransactionDetailModal transaction={selectedTransaction} onClose={handleCloseModal} />
      <FutureTransactionsModal 
        isOpen={isPendingModalOpen} 
        onClose={handleClosePendingModal} 
        transactions={pendingTransactions} 
      />
    </>
  );
};

export default HistoryView;