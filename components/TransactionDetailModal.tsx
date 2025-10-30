import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface TransactionDetailModalProps {
  transaction: (Transaction & { runningBalance: number }) | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; icon?: string }> = ({ label, value, icon }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <div className="flex items-center gap-2 mt-1">
      {icon && <span className="text-xl">{icon}</span>}
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  const { categories, accounts, deleteTransaction, openModal } = useAppContext();

  if (!transaction) return null;

  const handleEdit = () => {
    openModal(transaction);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Tem a certeza que deseja eliminar esta transação? Esta ação não pode ser desfeita.')) {
      deleteTransaction(transaction.id);
      onClose();
    }
  };

  const category = categories.find(c => c.id === transaction.categoryId);
  const account = accounts.find(a => a.id === transaction.accountId);
  const destinationAccount = accounts.find(a => a.id === transaction.destinationAccountId);

  const isExpense = transaction.type === TransactionType.EXPENSE;
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  const amountColor = isExpense ? 'text-red-500' : isTransfer ? 'text-blue-500' : 'text-green-500';
  const amountPrefix = isExpense ? '-' : isTransfer ? '' : '+';

  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-PT', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
    >
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold mb-2">Detalhes do Movimento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
        </div>
        
        <div className="mt-4 space-y-4">
            <div className="text-center border-b pb-4 border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
                <p className={`text-4xl font-bold my-2 ${amountColor}`}>
                    {amountPrefix} {transaction.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 {isTransfer ? (
                    <>
                        <DetailRow label="Origem" value={account?.name} icon={account?.icon} />
                        <DetailRow label="Destino" value={destinationAccount?.name} icon={destinationAccount?.icon}/>
                    </>
                ) : (
                    <>
                        <DetailRow label="Categoria" value={category?.name} icon={category?.icon} />
                        <DetailRow label="Conta" value={account?.name} icon={account?.icon}/>
                    </>
                )}
                
                <DetailRow label="Data" value={formattedDate} />
                <DetailRow label="Saldo Após" value={transaction.runningBalance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} />
            </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
             <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 font-semibold transition">
                <TrashIcon className="w-5 h-5" />
                <span>Eliminar</span>
            </button>
            <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition">
                <PencilIcon className="w-5 h-5" />
                <span>Editar</span>
            </button>
        </div>
      </div>
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.2s ease-out;
            }
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up {
                animation: slide-up 0.3s ease-out;
            }
       `}</style>
    </div>
  );
};

export default TransactionDetailModal;
