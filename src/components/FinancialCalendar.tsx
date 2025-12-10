
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowUpRight, ArrowDownLeft, Zap, CalendarDays } from 'lucide-react';
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
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Calendar Card (Left Side) */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-6 lg:p-8 flex flex-col transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-800 capitalize leading-none font-heading">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                </h2>
                <span className="text-sm font-bold text-slate-400">{currentDate.getFullYear()}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={prevMonth} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={nextMonth} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"><ChevronRight size={20}/></button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
            {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{d}</div>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {blanks.map(i => <div key={`blank-${i}`} className="h-20 lg:h-24"></div>)}
            
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
                            h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 border-2
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
        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between text-xs lg:hidden">
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

      {/* Selected Day Detail View (Right Panel on Desktop) */}
      <div className={`
          lg:w-[350px] shrink-0 bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-6 lg:p-8 overflow-hidden flex flex-col transition-all duration-300
          ${selectedDay ? 'opacity-100' : 'opacity-100'}
      `}>
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-6">
              {selectedDay ? (
                  <h3 className="font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-heading shadow-md">{selectedDay}</span>
                    <span className="font-heading text-lg">Detalle del Día</span>
                  </h3>
              ) : (
                  <h3 className="font-bold text-slate-800 flex items-center gap-3">
                     <span className="bg-indigo-50 text-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center"><CalendarDays size={20}/></span>
                     <span className="font-heading text-lg">Resumen Mes</span>
                  </h3>
              )}
              {selectedDay && (
                  <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-colors"><X size={20}/></button>
              )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {/* Fallback for no selection: Show Monthly Summary */}
              {!selectedDay && (
                  <div className="flex flex-col gap-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                          <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Ingresos Totales</p>
                          <p className="text-2xl font-black text-emerald-600">S/. {monthStats.income.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                          <p className="text-xs font-bold text-rose-400 uppercase mb-1">Gastos Totales</p>
                          <p className="text-2xl font-black text-rose-600">S/. {monthStats.expense.toLocaleString()}</p>
                      </div>
                      <div className="mt-4 text-center text-slate-400 text-sm">
                          Selecciona un día en el calendario para ver el detalle de movimientos.
                      </div>
                  </div>
              )}

              {/* Empty State for Selected Day */}
              {selectedDay && selectedData && selectedData.subs.length === 0 && selectedData.txs.length === 0 && (
                  <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm font-medium">Sin movimientos</p>
                      <p className="text-xs opacity-60 mt-1">No hay acciones para este día</p>
                  </div>
              )}

              {/* Subscriptions */}
              {selectedDay && selectedData?.subs.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                       <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl"><Zap size={18}/></div>
                           <div>
                               <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-bold">Suscripción</p>
                           </div>
                       </div>
                       <span className="font-bold text-slate-800 text-sm">- S/. {sub.amount}</span>
                  </div>
              ))}

              {/* Transactions */}
              {selectedDay && selectedData?.txs.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                       <div className="flex items-center gap-3">
                           <div className={`p-2.5 rounded-xl ${tx.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                               {tx.type === TransactionType.INCOME ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                           </div>
                           <div className="min-w-0">
                               <p className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{tx.description || tx.category}</p>
                               <p className="text-[10px] text-slate-500 uppercase font-bold">{tx.category}</p>
                           </div>
                       </div>
                       <span className={`font-bold text-sm whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
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
