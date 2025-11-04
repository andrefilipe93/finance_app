import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface FutureTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center transform transition-all animate-slide-up">
            <h3 className="text-lg font-bold">Confirmar Eliminação</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 my-4">
                Tem a certeza que deseja eliminar permanentemente este movimento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
                >
                    Eliminar
                </button>
            </div>
        </div>
    </div>
);


const FutureTransactionsModal: React.FC<FutureTransactionsModalProps> = ({ isOpen, onClose, transactions }) => {
  const { categories, accounts, openAddTransactionModalForEdit, deleteTransaction } = useAppContext();
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEdit = (transaction: Transaction) => {
    openAddTransactionModalForEdit(transaction);
    onClose();
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (transactionToDeleteId) {
        deleteTransaction(transactionToDeleteId);
        setTransactionToDeleteId(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all animate-slide-up max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Movimentos Pendentes</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
          </div>

          {transactions.length > 0 ? (
            <ul className="space-y-3 overflow-y-auto pr-2">
              {transactions.map(t => {
                const category = categories.find(c => c.id === t.categoryId);
                const account = accounts.find(a => a.id === t.accountId);
                const destinationAccount = accounts.find(a => a.id === t.destinationAccountId);
                const isExpense = t.type === TransactionType.EXPENSE;
                const isTransfer = t.type === TransactionType.TRANSFER;
                const formattedDate = new Date(t.date).toLocaleDateString('pt-PT', {
                  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                });

                return (
                  <li
                    key={t.id}
                    className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3 flex-grow min-w-0">
                      <div className="text-2xl">{isTransfer ? '🔄' : category?.icon || '💸'}</div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isTransfer ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{account?.name} → {destinationAccount?.name}</p>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{category?.name} &bull; {account?.name}</p>
                            )}
                             <span className="text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 px-2 py-0.5 rounded-full flex-shrink-0">PENDENTE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-sm ${isExpense ? 'text-red-500' : isTransfer ? 'text-gray-700 dark:text-gray-200' : 'text-green-500'}`}>
                        {isExpense ? '-' : isTransfer ? '' : '+'}{(t.amount ?? 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button onClick={() => handleEdit(t)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Editar movimento">
                          <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteClick(t.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Eliminar movimento">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum movimento pendente agendado.</p>
          )}
          <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
            @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slide-up 0.3s ease-out; }
          `}</style>
        </div>
      </div>
      {transactionToDeleteId && (
        <ConfirmationModal 
            onConfirm={handleConfirmDelete} 
            onCancel={() => setTransactionToDeleteId(null)} 
        />
      )}
    </>
  );
};

export default FutureTransactionsModal;