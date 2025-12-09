import React from 'react';
import { Trash2, Repeat, Shuffle, Utensils, Home, Car, Tv, HeartPulse, ShoppingBag, GraduationCap, Zap, CreditCard, HelpCircle, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case Category.FOOD: return <Utensils size={16} />;
    case Category.HOUSING: return <Home size={16} />;
    case Category.TRANSPORT: return <Car size={16} />;
    case Category.ENTERTAINMENT: return <Tv size={16} />;
    case Category.HEALTH: return <HeartPulse size={16} />;
    case Category.SHOPPING: return <ShoppingBag size={16} />;
    case Category.EDUCATION: return <GraduationCap size={16} />;
    case Category.SERVICES: return <Zap size={16} />;
    case Category.DEBT: return <CreditCard size={16} />;
    case Category.FIXED_INCOME: return <Wallet size={16} />;
    case Category.VARIABLE_INCOME: return <Wallet size={16} />;
    default: return <HelpCircle size={16} />;
  }
};

const getCategoryColor = (category: Category) => {
    switch (category) {
        case Category.FOOD: return 'bg-orange-100 text-orange-600';
        case Category.HOUSING: return 'bg-blue-100 text-blue-600';
        case Category.TRANSPORT: return 'bg-yellow-100 text-yellow-600';
        case Category.ENTERTAINMENT: return 'bg-purple-100 text-purple-600';
        case Category.HEALTH: return 'bg-rose-100 text-rose-600';
        case Category.SHOPPING: return 'bg-pink-100 text-pink-600';
        case Category.EDUCATION: return 'bg-indigo-100 text-indigo-600';
        case Category.SERVICES: return 'bg-cyan-100 text-cyan-600';
        case Category.DEBT: return 'bg-red-100 text-red-600';
        case Category.FIXED_INCOME: return 'bg-emerald-100 text-emerald-600';
        case Category.VARIABLE_INCOME: return 'bg-teal-100 text-teal-600';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  // Sort by date desc
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Movimientos</h3>
            <p className="text-xs text-slate-400 mt-1">Últimas transacciones registradas</p>
        </div>
        <div className="px-3 py-1 bg-slate-50 rounded-full text-xs font-medium text-slate-500">
            {transactions.length} registros
        </div>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Shuffle size={24} className="opacity-20" />
          </div>
          <p>Aún no hay movimientos.</p>
          <p className="text-xs mt-2 opacity-60">Usa el formulario para registrar tu primera transacción.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div className="space-y-2">
              {sortedTransactions.map((transaction) => (
                <div 
                    key={transaction.id} 
                    className="group bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl p-4 transition-all flex items-center gap-4 relative"
                >
                    {/* Icon Box */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(transaction.category)}`}>
                        {getCategoryIcon(transaction.category)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-slate-800 truncate pr-2">{transaction.description}</h4>
                            <span className={`font-bold text-sm whitespace-nowrap flex items-center gap-1 ${
                                transaction.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'
                            }`}>
                                {transaction.type === TransactionType.INCOME ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                                S/. {transaction.amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">{new Date(transaction.date).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                {transaction.isFixed ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        FIJO
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">
                                        VAR
                                    </span>
                                )}
                             </div>
                        </div>
                    </div>

                    {/* Delete Action (Hover) */}
                    <button 
                      onClick={() => onDelete(transaction.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;