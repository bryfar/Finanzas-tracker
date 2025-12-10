import React from 'react';
import { Trash2, Utensils, Home, Car, Tv, HeartPulse, ShoppingBag, GraduationCap, Zap, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';
import Mascot from './Mascot';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case Category.FOOD: return <Utensils size={20} />;
    case Category.HOUSING: return <Home size={20} />;
    case Category.TRANSPORT: return <Car size={20} />;
    case Category.ENTERTAINMENT: return <Tv size={20} />;
    case Category.HEALTH: return <HeartPulse size={20} />;
    case Category.SHOPPING: return <ShoppingBag size={20} />;
    case Category.EDUCATION: return <GraduationCap size={20} />;
    case Category.SERVICES: return <Zap size={20} />;
    case Category.DEBT: return <CreditCard size={20} />;
    default: return <Wallet size={20} />;
  }
};

const getCategoryStyles = (category: Category) => {
    switch (category) {
        case Category.FOOD: return 'bg-orange-100 text-orange-600';
        case Category.HOUSING: return 'bg-blue-100 text-blue-600';
        case Category.TRANSPORT: return 'bg-yellow-100 text-yellow-600';
        case Category.ENTERTAINMENT: return 'bg-purple-100 text-purple-600';
        case Category.HEALTH: return 'bg-rose-100 text-rose-600';
        case Category.SHOPPING: return 'bg-pink-100 text-pink-600';
        case Category.FIXED_INCOME: return 'bg-brand-100 text-brand-600';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const formatDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const grouped = sortedTransactions.reduce((acc, tx) => {
      const group = formatDateGroup(tx.date);
      if (!acc[group]) acc[group] = [];
      acc[group].push(tx);
      return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-black text-2xl text-slate-900">Actividad Reciente</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
             {sortedTransactions.length} Movimientos
          </span>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center p-16 text-center text-slate-400 min-h-[400px]">
          <Mascot variant="sad" size={140} className="mb-6 grayscale opacity-60" />
          <p className="font-heading font-bold text-xl text-slate-600">Todo está muy tranquilo...</p>
          <p className="text-sm mt-2 opacity-60 max-w-[250px] text-slate-500 font-medium">No hay movimientos recientes. ¡Registra tus gastos o ingresos para verlos aquí!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(grouped) as [string, Transaction[]][]).map(([dateLabel, txs]) => (
              <div key={dateLabel} className="relative">
                  <div className="sticky top-20 lg:top-24 z-10 mb-4 flex justify-center pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest shadow-sm border border-slate-100">
                          {dateLabel}
                      </span>
                  </div>
                  <div className="space-y-3">
                      {txs.map((tx) => (
                        <div key={tx.id} className="card-base group flex items-center gap-5 p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default relative overflow-hidden">
                            {/* Icon Squircle */}
                            <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-300 ${getCategoryStyles(tx.category)}`}>
                                {getCategoryIcon(tx.category)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-heading font-bold text-slate-800 truncate text-base pr-4">{tx.description || tx.category}</h4>
                                    <span className={`font-heading font-black text-lg whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === TransactionType.INCOME ? '+' : '-'} S/. {tx.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{tx.category}</span>
                                    {tx.isFixed && <span className="text-[10px] font-black text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-lg">FIJO</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                                  className="p-3 bg-rose-50 text-rose-500 shadow-md border border-rose-100 rounded-2xl hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;