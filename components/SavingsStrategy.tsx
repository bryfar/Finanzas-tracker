
import React, { useMemo } from 'react';
import { ShieldCheck, Zap, TrendingUp, Info, AlertCircle, Sparkles, Gem } from 'lucide-react';
import { Transaction, TransactionType, Category, StrategyBucket } from '../types';
import { Card } from './ui/Card';
import Mascot from './Mascot';

interface SavingsStrategyProps {
  transactions: Transaction[];
}

const SavingsStrategy: React.FC<SavingsStrategyProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    
    const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    
    const essentialsCats = [Category.HOUSING, Category.SERVICES, Category.TRANSPORT, Category.FOOD, Category.HEALTH, Category.DEBT];
    const lifestyleCats = [Category.ENTERTAINMENT, Category.SHOPPING, Category.OTHER];

    const essentialsSpend = monthTxs.filter(t => t.type === TransactionType.EXPENSE && essentialsCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    const lifestyleSpend = monthTxs.filter(t => t.type === TransactionType.EXPENSE && lifestyleCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    
    const futureAmount = Math.max(0, income - essentialsSpend - lifestyleSpend);

    const buckets: StrategyBucket[] = [
      { id: 'ESSENTIALS', label: 'Esenciales', percentage: 50, current: essentialsSpend, target: income * 0.5, color: 'text-indigo-600', categories: essentialsCats },
      { id: 'LIFESTYLE', label: 'Estilo de Vida', percentage: 20, current: lifestyleSpend, target: income * 0.2, color: 'text-rose-500', categories: lifestyleCats },
      { id: 'FUTURE', label: 'Futuro (Categoría Millonaria)', percentage: 30, current: futureAmount, target: income * 0.3, color: 'text-amber-500', categories: [] }
    ];

    return { income, buckets, futureAmount };
  }, [transactions]);

  const renderProgressBar = (bucket: StrategyBucket) => {
    const percent = bucket.target > 0 ? (bucket.current / bucket.target) * 100 : 0;
    const isExceeded = bucket.id !== 'FUTURE' && percent > 100;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${bucket.id === 'ESSENTIALS' ? 'bg-indigo-500' : bucket.id === 'LIFESTYLE' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            <span className="font-heading font-black text-sm text-slate-800">{bucket.label}</span>
          </div>
          <span className={`text-xs font-bold ${isExceeded ? 'text-rose-500' : 'text-slate-400'}`}>
            S/. {bucket.current.toLocaleString()} / S/. {bucket.target.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-rose-500' : bucket.id === 'ESSENTIALS' ? 'bg-indigo-500' : bucket.id === 'LIFESTYLE' ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Strategy */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 p-8 opacity-10">
           <Gem size={150} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Sparkles className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-heading font-black">Estrategia 50/20/30</h2>
                    <p className="text-slate-400 font-medium">Planificación Maestra de tu Riqueza</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {stats.buckets.map(b => (
                    <div key={b.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{b.percentage}% {b.label}</p>
                        <p className="text-2xl font-heading font-black">S/. {b.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Progress Buckets */}
        <div className="xl:col-span-7 space-y-6">
            <Card className="p-8 space-y-8">
                <h3 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-500" /> Estado del Mes Actual
                </h3>
                {stats.buckets.map(b => (
                   <div key={b.id}>
                        {renderProgressBar(b)}
                   </div>
                ))}
            </Card>

            {/* AI Advisor Contextual Tip */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex gap-4 items-start">
                <Mascot variant="thinking" size={60} />
                <div className="space-y-2">
                    <h4 className="font-heading font-bold text-indigo-900">Análisis de Finny</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                        {stats.buckets[0].current > stats.buckets[0].target 
                            ? "Tus gastos esenciales están superando el 50%. Deberíamos revisar tus suscripciones o buscar formas de optimizar servicios básicos."
                            : "¡Excelente gestión! Mantienes tus esenciales bajo control, lo que te permite potenciar tu Categoría Millonaria."}
                    </p>
                </div>
            </div>
        </div>

        {/* Millionaire Category Breakdown */}
        <div className="xl:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-heading font-black mb-1 flex items-center gap-2">
                        <Gem size={24} /> Categoría Millonaria
                    </h3>
                    <p className="text-amber-100/80 text-sm font-medium mb-6">Inversión y Futuro (30%)</p>
                    
                    <div className="space-y-5">
                        <InvestmentPillar 
                            icon={<ShieldCheck size={18}/>}
                            label="Fondo de Emergencia"
                            amount={stats.futureAmount * 0.4}
                            desc="Tu colchón de seguridad (40%)"
                        />
                        <InvestmentPillar 
                            icon={<Zap size={18}/>}
                            label="Plazo Fijo"
                            amount={stats.futureAmount * 0.3}
                            desc="Crecimiento seguro (30%)"
                        />
                        <InvestmentPillar 
                            icon={<TrendingUp size={18}/>}
                            label="Largo Plazo"
                            amount={stats.futureAmount * 0.3}
                            desc="Tu jubilación millonaria (30%)"
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Disponible</span>
                        <span className="text-3xl font-heading font-black">S/. {stats.futureAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

interface InvestmentPillarProps {
    icon: React.ReactNode;
    label: string;
    amount: number;
    desc: string;
}

const InvestmentPillar: React.FC<InvestmentPillarProps> = ({ icon, label, amount, desc }) => (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-sm leading-none mb-1">{label}</p>
                    <p className="text-[10px] text-amber-100 font-medium">{desc}</p>
                </div>
            </div>
            <p className="font-black text-lg">S/. {amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
    </div>
);

export default SavingsStrategy;
