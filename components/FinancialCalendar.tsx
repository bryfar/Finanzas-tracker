
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';
import { Transaction, Subscription, TransactionType } from '../types';

interface FinancialCalendarProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
}

const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ transactions, subscriptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      setSelectedDay(null);
  };
  const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      setSelectedDay(null);
  };

  const getDayData = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const txs = transactions.filter(t => t.date === dateStr);
    
    const subs = subscriptions.filter(s => {
        // Simple monthly check
        return new Date(s.nextPaymentDate).getDate() === day;
    });

    return { txs, subs };
  };

  const selectedData = useMemo(() => {
      if (!selectedDay) return null;
      return getDayData(selectedDay);
  }, [selectedDay, currentDate, transactions, subscriptions]);

  const monthStats = useMemo(() => {
     let income = 0; 
     let expense = 0;
     const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
     
     transactions.filter(t => t.date.startsWith(monthStr)).forEach(t => {
         if (t.type === TransactionType.INCOME) income += t.amount;
         else expense += t.amount;
     });
     return { income, expense };
  }, [currentDate, transactions]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Calendar Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col transition-all shrink-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-black text-slate-800 capitalize leading-none">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                </h2>
                <span className="text-sm font-bold text-slate-400">{currentDate.getFullYear()}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
            {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{d}</div>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2">
            {blanks.map(i => <div key={`blank-${i}`} className="aspect-square"></div>)}
            
            {days.map(day => {
                const { txs, subs } = getDayData(day);
                const hasIncome = txs.some(t => t.type === TransactionType.INCOME);
                const hasExpense = txs.some(t => t.type === TransactionType.EXPENSE);
                const hasSub = subs.length > 0;
                
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const isSelected = selectedDay === day;

                return (
                    <button 
                        key={day} 
                        onClick={() => setSelectedDay(day)}
                        className={`
                            aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 border-2
                            ${isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 z-10' 
                                : isToday 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                            }
                        `}
                    >
                        <span className="text-sm font-bold">{day}</span>
                        
                        {/* Dots Indicators */}
                        <div className="flex gap-0.5 mt-1">
                            {hasSub && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-yellow-400'}`}></div>}
                            {hasIncome && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`}></div>}
                            {hasExpense && !hasSub && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`}></div>}
                        </div>
                    </button>
                );
            })}
        </div>

        {/* Monthly Mini Stats */}
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between text-xs">
             <div className="text-center w-1/2 border-r border-slate-50">
                 <p className="text-slate-400 font-bold uppercase mb-1">Entradas</p>
                 <p className="text-emerald-500 font-black text-sm">S/. {monthStats.income.toLocaleString()}</p>
             </div>
             <div className="text-center w-1/2">
                 <p className="text-slate-400 font-bold uppercase mb-1">Salidas</p>
                 <p className="text-rose-500 font-black text-sm">S/. {monthStats.expense.toLocaleString()}</p>
             </div>
        </div>
      </div>

      {/* Selected Day Detail View */}
      <div className={`flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden flex flex-col transition-all duration-300 ${selectedDay ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <span className="bg-slate-400 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm">{selectedDay || '-'}</span>
                 <span>Detalle del Día</span>
              </h3>
              {selectedDay && (
                  <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"><X size={18}/></button>
              )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {selectedData && selectedData.subs.length === 0 && selectedData.txs.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                      <p className="text-sm font-medium">Sin movimientos</p>
                      <p className="text-xs opacity-60">No hay acciones para este día</p>
                  </div>
              )}

              {/* Subscriptions */}
              {selectedData?.subs.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                       <div className="flex items-center gap-3">
                           <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Zap size={16}/></div>
                           <div>
                               <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-bold">Suscripción</p>
                           </div>
                       </div>
                       <span className="font-bold text-slate-800 text-sm">- S/. {sub.amount}</span>
                  </div>
              ))}

              {/* Transactions */}
              {selectedData?.txs.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${tx.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                               {tx.type === TransactionType.INCOME ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                           </div>
                           <div>
                               <p className="font-bold text-slate-800 text-sm">{tx.description || tx.category}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-bold">{tx.category}</p>
                           </div>
                       </div>
                       <span className={`font-bold text-sm ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                           {tx.type === TransactionType.INCOME ? '+' : '-'} S/. {tx.amount}
                       </span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;
