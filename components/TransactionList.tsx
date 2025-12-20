
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getCategoryIcon, getCategoryStyle } from '../data/categories';
import Mascot from './Mascot';
import { Card } from './ui/Card';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

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
        <Card className="flex flex-col items-center justify-center p-16 text-center text-slate-400 min-h-[400px]">
          <Mascot variant="sad" size={140} className="mb-6 grayscale opacity-60" />
          <p className="font-heading font-bold text-xl text-slate-600">Todo está muy tranquilo...</p>
          <p className="text-sm mt-2 opacity-60 max-w-[250px] text-slate-500 font-medium">No hay movimientos recientes. ¡Registra tus gastos o ingresos para verlos aquí!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Object.entries(grouped) as [string, Transaction[]][]).map(([dateLabel, txs]) => (
              <div key={dateLabel} className="relative">
                  <div className="sticky top-20 lg:top-24 z-10 mb-4 flex justify-start pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm border border-slate-100">
                          {dateLabel}
                      </span>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                      {txs.map((tx) => (
                        <Card key={tx.id} className="group flex items-center gap-4 p-3 lg:p-4 hover:-translate-y-0.5 transition-all cursor-default relative overflow-hidden">
                            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-[1rem] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300 ${getCategoryStyle(tx.category)}`}>
                                {getCategoryIcon(tx.category)}
                            </div>

                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-heading font-bold text-slate-800 truncate text-sm lg:text-base pr-4">{tx.description || tx.category}</h4>
                                    <span className={`font-heading font-black text-base lg:text-lg whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === TransactionType.INCOME ? '+' : '-'} S/. {tx.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.category}</span>
                                    {tx.isFixed && <span className="text-[9px] font-black text-brand-600 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-md">FIJO</span>}
                                </div>
                            </div>

                            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                                  className="p-2.5 bg-rose-50 text-rose-500 shadow-md border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </Card>
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
