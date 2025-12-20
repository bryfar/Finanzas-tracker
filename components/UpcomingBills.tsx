
import React from 'react';
import { CalendarClock, BellRing, Check, Clock, Sparkles } from 'lucide-react';
import { RecurringTransaction, TransactionType } from '../types';

interface UpcomingBillsProps {
  recurring: RecurringTransaction[];
  onProcess: (rec: RecurringTransaction) => void;
}

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ recurring, onProcess }) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toISOString().slice(0, 7);

  // Filtrar los que vencen pronto (próximos 7 días) o están pendientes del mes
  const upcoming = recurring.filter(r => {
      // Si ya se procesó este mes, no mostrar
      if (r.lastProcessedMonth === currentMonth) return false;
      
      // Mostrar si falta poco para el día o si ya pasó y sigue pendiente
      return r.dayOfMonth <= currentDay + 7;
  }).sort((a, b) => a.dayOfMonth - b.dayOfMonth);

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <CalendarClock size={20} className="text-brand-500" /> Programados
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{upcoming.length} pendientes</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
          {upcoming.map(item => {
              const isOverdue = item.dayOfMonth < currentDay;
              const isToday = item.dayOfMonth === currentDay;

              return (
                  <div key={item.id} className={`min-w-[200px] bg-white border p-4 rounded-3xl shadow-soft relative overflow-hidden flex flex-col justify-between ${isOverdue ? 'border-rose-100' : 'border-slate-100'}`}>
                      {item.isAuto && (
                          <div className="absolute top-2 right-2 p-1 bg-brand-50 text-brand-500 rounded-lg" title="Automático">
                              <Sparkles size={12} />
                          </div>
                      )}
                      
                      <div className="mb-4">
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isOverdue ? 'text-rose-500' : isToday ? 'text-brand-600' : 'text-slate-400'}`}>
                              {isOverdue ? 'Vencido' : isToday ? 'Vence Hoy' : `Vence el ${item.dayOfMonth}`}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                          <p className={`font-black text-lg ${item.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                              S/. {item.amount.toLocaleString()}
                          </p>
                      </div>

                      <button 
                        onClick={() => onProcess(item)}
                        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isToday || isOverdue ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                          <Check size={14} /> Registrar Pago
                      </button>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default UpcomingBills;
