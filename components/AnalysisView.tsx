
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
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ transactions, subscriptions }) => {
  const [view, setView] = useState<'CALENDAR' | 'REPORT' | 'STRATEGY' | 'INSIGHTS'>('STRATEGY');
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
      if (view === 'INSIGHTS') {
          setAnomalies(detectAnomalies(transactions));
      }
  }, [view, transactions]);

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
           {[
               { id: 'STRATEGY', icon: Target, label: 'Estrategia 50/20/30' },
               { id: 'CALENDAR', icon: Calendar, label: 'Calendario' },
               { id: 'REPORT', icon: BarChart2, label: 'Reporte' },
               { id: 'INSIGHTS', icon: Zap, label: 'Insights IA' },
           ].map(item => (
               <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${view === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                   <item.icon size={16} /> {item.label}
               </button>
           ))}
       </div>

       <div className="flex-1 min-h-0">
           {view === 'STRATEGY' && <SavingsStrategy transactions={transactions} />}
           {view === 'CALENDAR' && <FinancialCalendar transactions={transactions} subscriptions={subscriptions} />}
           {view === 'REPORT' && (
               <div className="h-[600px]">
                   <FinancialChart transactions={transactions} />
               </div>
           )}
           {view === 'INSIGHTS' && (
               <div className="space-y-6">
                   <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10">
                            <Mascot variant="thinking" size={150} />
                        </div>
                        <h3 className="text-2xl font-heading font-black mb-2">Análisis Inteligente</h3>
                        <p className="opacity-80 max-w-sm">Finny busca patrones extraños en tus gastos para ayudarte a ahorrar.</p>
                   </div>

                   <div className="space-y-4">
                       {anomalies.length === 0 ? (
                           <div className="text-center py-12">
                               <Mascot variant="happy" size={100} className="mx-auto mb-4" />
                               <p className="text-slate-500 font-bold">Todo se ve normal por aquí.</p>
                           </div>
                       ) : (
                           anomalies.map(a => (
                               <div key={a.id} className="card-base p-4 flex gap-4 items-start border-l-4 border-l-yellow-400">
                                   <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                                       <AlertCircle size={24} />
                                   </div>
                                   <div>
                                       <p className="font-bold text-slate-800 text-sm mb-1">{a.type === 'ANOMALY' ? 'Anomalía Detectada' : 'Advertencia'}</p>
                                       <p className="text-slate-600 text-sm">{a.message}</p>
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
