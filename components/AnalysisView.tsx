
import React, { useState, useEffect } from 'react';
import { Calendar, BarChart2, AlertCircle, Zap, Target } from 'lucide-react';
import { Transaction, Subscription } from '../types';
import FinancialCalendar from './FinancialCalendar';
import FinancialChart from './FinancialChart';
import SavingsStrategy from './SavingsStrategy';
import { detectAnomalies } from '../services/geminiService';
import Mascot from './Mascot';

interface AnalysisViewProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  userId: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ transactions, subscriptions, userId }) => {
  const [view, setView] = useState<'STRATEGY' | 'CALENDAR' | 'REPORT' | 'INSIGHTS'>('STRATEGY');
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
      if (view === 'INSIGHTS') {
          setAnomalies(detectAnomalies(transactions));
      }
  }, [view, transactions]);

  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
       {/* Optimized Scrollable Tabs for Mobile */}
       <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-full overflow-x-auto no-scrollbar snap-x">
           {[
               { id: 'STRATEGY', icon: Target, label: 'Estrategia' },
               { id: 'CALENDAR', icon: Calendar, label: 'Calendario' },
               { id: 'REPORT', icon: BarChart2, label: 'Gráficos' },
               { id: 'INSIGHTS', icon: Zap, label: 'IA Insights' },
           ].map(item => (
               <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap snap-start ${view === item.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                   <item.icon size={16} strokeWidth={2.5} /> {item.label}
               </button>
           ))}
       </div>

       <div className="flex-1 min-h-0 animate-fade-in">
           {view === 'STRATEGY' && <SavingsStrategy transactions={transactions} userId={userId} />}
           {view === 'CALENDAR' && <FinancialCalendar transactions={transactions} subscriptions={subscriptions} />}
           {view === 'REPORT' && (
               <div className="h-[500px] lg:h-[600px]">
                   <FinancialChart transactions={transactions} />
               </div>
           )}
           {view === 'INSIGHTS' && (
               <div className="space-y-6">
                   <div className="bg-indigo-600 rounded-[2rem] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                        <div className="absolute right-0 top-0 opacity-10">
                            <Mascot variant="thinking" size={120} />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-heading font-black mb-2">Análisis de Finny</h3>
                        <p className="opacity-80 text-xs lg:text-sm max-w-sm font-medium">He analizado tus hábitos recientes y esto es lo que encontré...</p>
                   </div>

                   <div className="space-y-4">
                       {anomalies.length === 0 ? (
                           <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
                               <Mascot variant="happy" size={100} className="mx-auto mb-4" />
                               <p className="text-slate-500 font-black text-sm uppercase tracking-widest">Sin anomalías detectadas</p>
                               <p className="text-[10px] text-slate-400 mt-1">¡Tus gastos siguen un patrón saludable!</p>
                           </div>
                       ) : (
                           anomalies.map(a => (
                               <div key={a.id} className="bg-white p-5 rounded-[1.5rem] flex gap-4 items-start border border-slate-100 shadow-sm border-l-4 border-l-amber-400 transition-transform active:scale-[0.98]">
                                   <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                                       <AlertCircle size={24} />
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{a.type === 'ANOMALY' ? 'Gasto Inusual' : 'Sugerencia'}</p>
                                       <p className="text-slate-700 text-sm font-bold leading-relaxed">{a.message}</p>
                                       <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(a.date).toLocaleDateString()}</p>
                                   </div>
                               </div>
                           ))
                       )}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default AnalysisView;
