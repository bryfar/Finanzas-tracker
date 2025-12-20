
import React from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
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
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = sortedTransactions.reduce((acc, tx) => {
      const group = formatDateGroup(tx.date);
      if (!acc[group]) acc[group] = [];
      acc[group].push(tx);
      return acc;
  }, {} as Record<string, Transaction[]>);

  if (sortedTransactions.length === 0) return (
      <Card className="p-12 text-center text-slate-400 flex flex-col items-center">
          <Mascot variant="sad" size={100} className="mb-4 opacity-40 grayscale" />
          <p className="font-heading font-black text-slate-600 uppercase tracking-widest text-[10px]">Sin actividad reciente</p>
      </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-black text-xl text-slate-900">Actividad</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{transactions.length} regs</span>
      </div>
      
      {(Object.entries(grouped) as [string, Transaction[]][]).map(([dateLabel, txs]) => (
        <div key={dateLabel} className="space-y-3">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{dateLabel}</span>
             <div className="h-px w-full bg-slate-100"></div>
          </div>
          
          <div className="space-y-2">
            {txs.map((tx) => (
              <div key={tx.id} className="bg-white p-3.5 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${getCategoryStyle(tx.category)}`}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{tx.description || tx.category}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.category}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className={`font-heading font-black text-sm whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'} S/. {tx.amount.toFixed(0)}
                    </p>
                    {tx.isFixed && <span className="text-[8px] font-black bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded uppercase">Fijo</span>}
                  </div>
                  <button 
                    onClick={() => onDelete(tx.id)} 
                    className="p-2 text-slate-300 hover:text-rose-500 active:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
