
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

  if (sortedTransactions.length === 0) return (
      <Card className="p-16 text-center text-slate-400 flex flex-col items-center">
          <Mascot variant="sad" size={120} className="mb-6 opacity-60 grayscale" />
          <p className="font-heading font-bold text-xl text-slate-600">No hay movimientos aún</p>
          <p className="text-sm mt-2 max-w-[250px] mx-auto">Tus gastos e ingresos aparecerán aquí agrupados por fecha.</p>
      </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-2xl text-slate-900">Actividad Reciente</h3>
          <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {transactions.length} registros
          </div>
      </div>
      
      {(Object.entries(grouped) as [string, Transaction[]][]).map(([dateLabel, txs]) => (
        <div key={dateLabel} className="relative">
          <div className="sticky top-0 z-20 py-2 bg-surface/90 backdrop-blur-md mb-4 flex">
            <span className="bg-white px-4 py-1.5 rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {dateLabel}
            </span>
          </div>
          <div className="space-y-3">
            {txs.map((tx) => (
              <Card key={tx.id} className="group flex items-center gap-4 p-4 hover:-translate-y-1 hover:shadow-xl transition-all relative overflow-hidden">
                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-300 ${getCategoryStyle(tx.category)}`}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-heading font-bold text-slate-800 text-sm lg:text-base truncate pr-4">{tx.description || tx.category}</p>
                    <p className={`font-heading font-black text-base lg:text-lg whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'} S/. {tx.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{tx.category}</p>
                      {tx.isFixed && <span className="text-[9px] font-black bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-lg">FIJO</span>}
                  </div>
                </div>
                
                <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }} 
                        className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-90"
                    >
                        <Trash2 size={18} strokeWidth={2.5}/>
                    </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
