
import React, { useState, useEffect } from 'react';
import { Calendar, BarChart2, AlertCircle, Zap, Target, PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';
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
    <div className="space-y-6 h-full flex flex-col pb-12 animate-fade-in">
      {/* Menú de Navegación Interna (Tabs) */}
      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-[2rem] w-full overflow-x-auto no-scrollbar snap-x shadow-inner">
        {[
          { id: 'STRATEGY', icon: Target, label: 'Estrategia' },
          { id: 'CALENDAR', icon: Calendar, label: 'Calendario' },
          { id: 'REPORT', icon: BarChart2, label: 'Gráficos' },
          { id: 'INSIGHTS', icon: Zap, label: 'IA Insights' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap snap-start flex-1 justify-center ${
              view === item.id ? 'bg-white text-brand-600 shadow-md' : 'text-slate-400'
            }`}
          >
            <item.icon size={16} strokeWidth={3} /> {item.label}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1 min-h-0">
        {view === 'STRATEGY' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-soft">
               <h3 className="text-lg font-heading font-black text-slate-900 mb-2">Regla 50/30/20</h3>
               <p className="text-xs text-slate-500 mb-6">Tu presupuesto ideal vs. gasto real este mes.</p>
               <SavingsStrategy transactions={transactions} userId={userId} />
            </div>
            <div className="bg-brand-50 p-6 rounded-[2rem] border border-brand-100 flex gap-4 items-center">
                <div className="p-3 bg-white rounded-2xl text-brand-600 shadow-sm">
                    <Info size={20} />
                </div>
                <p className="text-xs font-medium text-brand-900 leading-relaxed">
                   Finny dice: "Mantener tus necesidades bajo el 50% es la clave para la libertad financiera".
                </p>
            </div>
          </div>
        )}
        
        {view === 'CALENDAR' && (
          <div className="animate-pop-in">
            <FinancialCalendar transactions={transactions} subscriptions={subscriptions} />
          </div>
        )}
        
        {view === 'REPORT' && (
          <div className="space-y-6">
            <div className="h-[400px]">
              <FinancialChart transactions={transactions} />
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Histórico de Patrimonio
                </h4>
                <div className="h-40 w-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100">
                    Procesando datos históricos...
                </div>
            </div>
          </div>
        )}
        
        {view === 'INSIGHTS' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                <Mascot variant="thinking" size={150} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mb-4">
                    <Zap size={24} className="fill-current text-yellow-300" />
                </div>
                <h3 className="text-2xl font-heading font-black mb-2">IA Insights</h3>
                <p className="opacity-70 text-sm font-medium">Finny analizó tus últimos 30 días buscando patrones invisibles.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {anomalies.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-soft">
                    <Mascot variant="happy" size={120} className="mx-auto mb-6" />
                    <p className="text-slate-500 font-black text-sm uppercase tracking-widest">¡Excelente gestión!</p>
                    <p className="text-[11px] text-slate-400 mt-2 px-12">No he detectado fugas de dinero inusuales este mes.</p>
                  </div>
                ) : (
                  anomalies.map(a => (
                    <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft border-l-4 border-l-brand-500 flex gap-5 items-start animate-slide-up">
                      <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl shrink-0">
                        <AlertCircle size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{a.type === 'ANOMALY' ? 'Alerta de Gasto' : 'Sugerencia'}</p>
                        <p className="text-slate-800 text-sm font-bold leading-relaxed">{a.message}</p>
                        <div className="mt-4 flex gap-2">
                            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider">Ver Gasto</button>
                            <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-200">Ajustar Meta</button>
                        </div>
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
