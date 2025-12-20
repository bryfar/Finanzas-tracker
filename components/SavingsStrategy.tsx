
import React, { useMemo, useState, useEffect } from 'react';
import { ShieldCheck, Zap, TrendingUp, Info, AlertCircle, Sparkles, Gem, Plus, Trash2, PieChart as PieIcon, LineChart, Coins } from 'lucide-react';
import { Transaction, TransactionType, Category, StrategyBucket, Investment } from '../types';
import { Card } from './ui/Card';
import Mascot from './Mascot';
import { transactionService } from '../services/transactionService';

interface SavingsStrategyProps {
  transactions: Transaction[];
  userId: string;
}

const SavingsStrategy: React.FC<SavingsStrategyProps> = ({ transactions, userId }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddInv, setShowAddInv] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState<Investment['type']>('SAVINGS');
  const [invAmount, setInvAmount] = useState('');
  const [invRate, setInvRate] = useState('');
  const [invInstitution, setInvInstitution] = useState('');

  useEffect(() => {
      loadInvestments();
  }, [userId]);

  const loadInvestments = async () => {
      const data = await transactionService.getInvestments(userId);
      setInvestments(data);
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await transactionService.addInvestment(userId, {
              name: invName,
              type: invType,
              amount: parseFloat(invAmount),
              interestRate: parseFloat(invRate),
              institution: invInstitution,
              startDate: new Date().toISOString().split('T')[0]
          });
          setShowAddInv(false);
          setInvName(''); setInvAmount(''); setInvRate(''); setInvInstitution('');
          loadInvestments();
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteInv = async (id: string) => {
      if (confirm('¿Eliminar este activo?')) {
          await transactionService.deleteInvestment(userId, id);
          loadInvestments();
      }
  };

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    
    const essentialsCats = [Category.HOUSING, Category.SERVICES, Category.TRANSPORT, Category.FOOD, Category.HEALTH, Category.DEBT];
    const lifestyleCats = [Category.ENTERTAINMENT, Category.SHOPPING, Category.OTHER];

    const essentialsSpend = monthTxs.filter(t => t.type === TransactionType.EXPENSE && essentialsCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    const lifestyleSpend = monthTxs.filter(t => t.type === TransactionType.EXPENSE && lifestyleCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    
    const futureAmount = investments.reduce((s, i) => s + i.amount, 0);

    const buckets: StrategyBucket[] = [
      { id: 'ESSENTIALS', label: 'Esenciales', percentage: 50, current: essentialsSpend, target: income * 0.5, color: 'text-indigo-600', categories: essentialsCats },
      { id: 'LIFESTYLE', label: 'Estilo de Vida', percentage: 20, current: lifestyleSpend, target: income * 0.2, color: 'text-rose-500', categories: lifestyleCats },
      { id: 'FUTURE', label: 'Futuro (Categoría Millonaria)', percentage: 30, current: futureAmount, target: income * 0.3, color: 'text-amber-500', categories: [] }
    ];

    return { income, buckets, futureAmount };
  }, [transactions, investments]);

  // Simulador de Proyección 1 Año
  const projection = useMemo(() => {
      return investments.reduce((acc, inv) => {
          const monthlyRate = (inv.interestRate / 100) / 12;
          const projected = inv.amount * Math.pow(1 + monthlyRate, 12);
          return acc + projected;
      }, 0);
  }, [investments]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Dynamic Strategy Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Gem size={200} />
        </div>
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Sparkles className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-heading font-black">Tu Master Plan</h2>
                        <p className="text-slate-400 font-medium">Equilibrio 50/20/30 para libertad financiera</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ingresos del Mes</p>
                    <p className="text-2xl font-heading font-black">S/. {stats.income.toLocaleString()}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.buckets.map(b => (
                    <div key={b.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl group hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{b.percentage}% {b.label}</p>
                             <span className={`w-2 h-2 rounded-full ${b.id === 'ESSENTIALS' ? 'bg-indigo-400' : b.id === 'LIFESTYLE' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                        </div>
                        <p className="text-2xl font-heading font-black mb-1">S/. {b.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full ${b.id === 'ESSENTIALS' ? 'bg-indigo-400' : b.id === 'LIFESTYLE' ? 'bg-rose-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, (b.current / (b.target || 1)) * 100)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Bucket Details & AI */}
        <div className="xl:col-span-7 space-y-6">
            <Card className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-heading font-black text-xl text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-500" /> Monitoreo en Tiempo Real
                    </h3>
                    <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Corte al {new Date().toLocaleDateString()}
                    </div>
                </div>
                
                <div className="space-y-10">
                    {stats.buckets.map(bucket => {
                        const percent = bucket.target > 0 ? (bucket.current / bucket.target) * 100 : 0;
                        const isExceeded = bucket.id !== 'FUTURE' && percent > 100;
                        return (
                          <div key={bucket.id} className="space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <h4 className="font-heading font-black text-slate-800 text-sm">{bucket.label}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Objetivo Sugerido: S/. {bucket.target.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`text-lg font-black font-heading ${isExceeded ? 'text-rose-500' : 'text-slate-900'}`}>
                                    S/. {bucket.current.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-black ml-1">({percent.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 shadow-sm ${isExceeded ? 'bg-rose-500' : bucket.id === 'ESSENTIALS' ? 'bg-indigo-500' : bucket.id === 'LIFESTYLE' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                          </div>
                        );
                    })}
                </div>
            </Card>

            {/* AI Advisor Contextual Analysis */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-6 rounded-[2.5rem] flex gap-6 items-start shadow-sm group">
                <div className="shrink-0 relative">
                    <Mascot variant="thinking" size={80} />
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md text-indigo-500">
                        <Zap size={16} fill="currentColor" />
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-heading font-black text-indigo-900 text-lg">Finny Report</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                        {stats.buckets[0].current > stats.buckets[0].target 
                            ? "Detecté que tus gastos fijos (Esenciales) están consumiendo mucho oxígeno. Para que tu 'Categoría Millonaria' crezca, necesitamos bajar esos servicios o renegociar deudas."
                            : "Tu estructura de gastos es sólida. Tienes capacidad de sobra para aumentar tus inversiones. ¿Qué tal si movemos un 5% extra a tu fondo de retiro?"}
                    </p>
                    {investments.length > 0 && investments.some(i => i.interestRate < 4) && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 p-2 rounded-xl text-indigo-600 font-bold text-xs mt-2 border border-indigo-200">
                            <Info size={14} /> Tienes activos rindiendo menos del 4%. Hay opciones mejores en el mercado.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Investment Management */}
        <div className="xl:col-span-5 space-y-6">
            
            {/* Future/Investment Management Panel */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden flex flex-col">
                <div className="bg-amber-500 p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-heading font-black flex items-center gap-2">
                            <Gem size={24} /> Categoría Millonaria
                        </h3>
                        <button onClick={() => setShowAddInv(!showAddInv)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-md transition-colors">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-100">Valor Actual de Activos</p>
                        <p className="text-4xl font-heading font-black">S/. {stats.futureAmount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Proyección Box */}
                <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                     <div>
                         <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Proyección 12 meses</p>
                         <p className="text-xl font-heading font-black text-amber-700">S/. {projection.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                     </div>
                     <LineChart className="text-amber-300" size={32} />
                </div>

                {/* Investment List */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {showAddInv && (
                        <form onSubmit={handleAddInvestment} className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-3 animate-fade-in mb-4">
                             <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-2">Registrar Nuevo Activo</h4>
                             <input type="text" placeholder="Nombre (Ej. Depósito Plazo Fijo)" className="input-base text-sm py-2.5" value={invName} onChange={e => setInvName(e.target.value)} required />
                             <div className="grid grid-cols-2 gap-2">
                                 <select className="input-base text-sm py-2.5" value={invType} onChange={e => setInvType(e.target.value as any)}>
                                     <option value="SAVINGS">Ahorros</option>
                                     <option value="FIXED_TERM">Plazo Fijo</option>
                                     <option value="STOCKS">Bolsa / ETFs</option>
                                     <option value="CRYPTO">Cripto</option>
                                     <option value="EMERGENCY_FUND">Fondo Emergencia</option>
                                 </select>
                                 <input type="text" placeholder="Institución" className="input-base text-sm py-2.5" value={invInstitution} onChange={e => setInvInstitution(e.target.value)} required />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                 <input type="number" step="0.01" placeholder="Monto S/." className="input-base text-sm py-2.5" value={invAmount} onChange={e => setInvAmount(e.target.value)} required />
                                 <input type="number" step="0.1" placeholder="TEA % (Interés)" className="input-base text-sm py-2.5" value={invRate} onChange={e => setInvRate(e.target.value)} required />
                             </div>
                             <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAddInv(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancelar</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20">{loading ? '...' : 'Registrar'}</button>
                             </div>
                        </form>
                    )}

                    {investments.length === 0 && !showAddInv && (
                        <div className="py-12 text-center text-slate-400">
                             <Coins size={40} className="mx-auto mb-3 opacity-20" />
                             <p className="text-sm font-bold">Sin activos registrados</p>
                             <button onClick={() => setShowAddInv(true)} className="text-amber-500 font-bold text-xs mt-1 underline">Añadir Inversión</button>
                        </div>
                    )}

                    {investments.map(inv => (
                        <div key={inv.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:border-amber-200 hover:shadow-md transition-all">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${inv.interestRate >= 7 ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                     {inv.type === 'CRYPTO' ? '₿' : inv.type === 'STOCKS' ? <TrendingUp size={18}/> : <ShieldCheck size={18}/>}
                                 </div>
                                 <div>
                                     <h5 className="font-bold text-slate-800 text-xs">{inv.name}</h5>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{inv.institution}</span>
                                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-black">TEA {inv.interestRate}%</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="text-right flex items-center gap-4">
                                 <div>
                                     <p className="text-sm font-black text-slate-900">S/. {inv.amount.toLocaleString()}</p>
                                 </div>
                                 <button onClick={() => handleDeleteInv(inv.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                     <Trash2 size={14} />
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strategy Pillar Recap */}
            <Card className="p-6 bg-slate-50 border-slate-200">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">¿Qué significa cada pilar?</h4>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="w-1.5 h-auto bg-indigo-500 rounded-full"></div>
                        <p className="text-[11px] text-slate-600"><span className="font-bold text-indigo-700">50% Esenciales:</span> Lo que necesitas para vivir. Si esto sube, pierdes libertad.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-1.5 h-auto bg-rose-500 rounded-full"></div>
                        <p className="text-[11px] text-slate-600"><span className="font-bold text-rose-700">20% Estilo de Vida:</span> Gastos flexibles, ocio y deseos. Es el primero que se corta en crisis.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-1.5 h-auto bg-amber-500 rounded-full"></div>
                        <p className="text-[11px] text-slate-600"><span className="font-bold text-amber-700">30% Futuro:</span> Tu fábrica de dinero. Inversiones y fondo de paz mental.</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default SavingsStrategy;
