import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Account } from '../types';
import Mascot from './Mascot';

interface AssetsViewProps {
  accounts: Account[];
}

const AssetsView: React.FC<AssetsViewProps> = ({ accounts }) => {
  const totalAssets = accounts.reduce((s, a) => s + (a.balance > 0 ? a.balance : 0), 0);
  const totalLiabilities = 0; // In a full app, we would track debts separately.
  const netWorth = totalAssets - totalLiabilities;
  
  // Simulated Score
  const healthScore = netWorth > 1000 ? 85 : 45; 
  const grade = healthScore > 80 ? 'A' : healthScore > 50 ? 'B' : 'C';

  return (
    <div className="space-y-8">
       {/* Health Score Header */}
       <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
           <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
               <div>
                   <div className="flex items-center gap-2 mb-2">
                       <Activity className="text-emerald-400" />
                       <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Diagnóstico IA</span>
                   </div>
                   <h2 className="text-4xl font-heading font-black mb-2">Salud Financiera</h2>
                   <p className="text-slate-400 max-w-md">Basado en tu relación deuda-ingreso y liquidez actual.</p>
               </div>
               
               <div className="flex items-center gap-6">
                   <div className="text-right">
                       <span className="block text-5xl font-heading font-black">{grade}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase">Calificación</span>
                   </div>
                   <div className="w-24 h-24 relative flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90">
                           <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="8" fill="none" />
                           <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - healthScore/100)} strokeLinecap="round" />
                       </svg>
                       <span className="absolute font-bold">{healthScore}</span>
                   </div>
               </div>
           </div>
       </div>

       {/* Net Worth Breakdown */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="card-base p-6 border-l-8 border-l-emerald-500">
               <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                       <TrendingUp size={24} />
                   </div>
                   <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">Activos Totales</p>
                       <p className="text-2xl font-black text-slate-800">S/. {totalAssets.toLocaleString()}</p>
                   </div>
               </div>
               <div className="space-y-2">
                   {accounts.map(a => (
                       <div key={a.id} className="flex justify-between text-sm p-2 hover:bg-slate-50 rounded-lg">
                           <span className="text-slate-600 font-medium">{a.name}</span>
                           <span className="font-bold">S/. {a.balance}</span>
                       </div>
                   ))}
               </div>
           </div>

           <div className="card-base p-6 border-l-8 border-l-rose-500 opacity-60">
               <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                       <TrendingDown size={24} />
                   </div>
                   <div>
                       <p className="text-xs font-bold text-slate-400 uppercase">Pasivos (Deudas)</p>
                       <p className="text-2xl font-black text-slate-800">S/. {totalLiabilities}</p>
                   </div>
               </div>
               <div className="flex flex-col items-center justify-center py-8">
                   <Mascot variant="celebrating" size={60} />
                   <p className="text-sm font-bold text-slate-500 mt-2">¡Sin deudas registradas!</p>
               </div>
           </div>
       </div>
    </div>
  );
};

export default AssetsView;
