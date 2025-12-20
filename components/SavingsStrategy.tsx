
import React, { useMemo, useState, useEffect } from 'react';
import { ShieldCheck, Zap, TrendingUp, Info, AlertCircle, Sparkles, Gem, Plus, Trash2, PieChart as PieIcon, LineChart, Coins, RefreshCw } from 'lucide-react';
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
      { id: 'LIFESTYLE', label: 'Estilo Vida', percentage: 20, current: lifestyleSpend, target: income * 0.2, color: 'text-rose-500', categories: lifestyleCats },
      { id: 'FUTURE', label: 'Futuro', percentage: 30, current: futureAmount, target: income * 0.3, color: 'text-amber-500', categories: [] }
    ];

    return { income, buckets, futureAmount };
  }, [transactions, investments]);

  const projection = useMemo(() => {
      return investments.reduce((acc, inv) => {
          const monthlyRate = (inv.interestRate / 100) / 12;
          const projected = inv.amount * Math.pow(1 + monthlyRate, 12);
          return acc + projected;
      }, 0);
  }, [investments]);

  return (
    <div className="space-y-6 pb-20">
      {/* Strategy Header Mobile Optimized */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-heading font-black">Plan 50/20/30</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estado del mes</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-500">Ingresos</p>
                    <p className="text-lg font-heading font-black">S/. {stats.income.toLocaleString()}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {stats.buckets.map(b => (
                    <div key={b.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{b.label}</p>
                        <p className="text-sm font-black mb-1">S/. {b.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <div className="h-1 bg-white/10 rounded-full">
                            <div className={`h-full ${b.id === 'ESSENTIALS' ? 'bg-indigo-400' : b.id === 'LIFESTYLE' ? 'bg-rose-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, (b.current / (b.target || 1)) * 100)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-4">
            <Card className="p-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-500" /> Detalle por pilar
                </h3>
                
                <div className="space-y-8">
                    {stats.buckets.map(bucket => {
                        const percent = bucket.target > 0 ? (bucket.current / bucket.target) * 100 : 0;
                        const isExceeded = bucket.id !== 'FUTURE' && percent > 100;
                        return (
                          <div key={bucket.id} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <div>
                                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">{bucket.label}</h4>
                                <p className="text-[9px] text-slate-400 font-bold">Límite: S/. {bucket.target.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`text-sm font-black ${isExceeded ? 'text-rose-500' : 'text-slate-900'}`}>
                                    S/. {bucket.current.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-black ml-1">({percent.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isExceeded ? 'bg-rose-500' : bucket.id === 'ESSENTIALS' ? 'bg-indigo-500' : bucket.id === 'LIFESTYLE' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                          </div>
                        );
                    })}
                </div>
            </Card>

            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex gap-4 items-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Mascot variant="thinking" size={40} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Análisis de Finny</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {stats.buckets[0].current > stats.buckets[0].target 
                            ? "Tus gastos fijos están altos. Intenta reducir servicios o suscripciones innecesarias."
                            : "¡Vas genial! Tienes espacio para ahorrar un poco más este mes."}
                    </p>
                </div>
            </div>
        </div>

        <div className="xl:col-span-5 space-y-4">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft overflow-hidden flex flex-col">
                <div className="bg-amber-500 p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-heading font-black">Categoría Millonaria</h3>
                        <button onClick={() => setShowAddInv(!showAddInv)} className="bg-white/20 p-2 rounded-xl active:scale-90 transition-all">
                            <Plus size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] font-black uppercase text-amber-100 mb-1">Total Activos</p>
                    <p className="text-3xl font-heading font-black">S/. {stats.futureAmount.toLocaleString()}</p>
                </div>

                <div className="p-4 space-y-3">
                    {showAddInv && (
                        <form onSubmit={handleAddInvestment} className="p-4 bg-slate-50 rounded-2xl space-y-3 animate-fade-in border-2 border-dashed border-slate-200">
                             <input type="text" placeholder="Nombre Activo" className="w-full bg-white rounded-xl p-3 text-xs font-bold outline-none" value={invName} onChange={e => setInvName(e.target.value)} required />
                             <div className="grid grid-cols-2 gap-2">
                                 <select className="bg-white rounded-xl p-3 text-xs font-bold outline-none" value={invType} onChange={e => setInvType(e.target.value as any)}>
                                     <option value="SAVINGS">Ahorros</option>
                                     <option value="FIXED_TERM">Plazo Fijo</option>
                                     <option value="CRYPTO">Cripto</option>
                                 </select>
                                 <input type="number" step="0.1" placeholder="TEA %" className="bg-white rounded-xl p-3 text-xs font-bold outline-none" value={invRate} onChange={e => setInvRate(e.target.value)} required />
                             </div>
                             <input type="number" placeholder="Monto S/." className="w-full bg-white rounded-xl p-3 text-xs font-bold outline-none" value={invAmount} onChange={e => setInvAmount(e.target.value)} required />
                             <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAddInv(false)} className="flex-1 py-2 text-slate-500 font-bold text-xs">Cancelar</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2 bg-amber-500 text-white rounded-xl font-black text-xs">Añadir</button>
                             </div>
                        </form>
                    )}

                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                        {investments.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group border border-transparent hover:border-amber-100 transition-all">
                                 <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                         {inv.type === 'CRYPTO' ? '₿' : <TrendingUp size={16}/>}
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-800 text-[10px] truncate max-w-[100px]">{inv.name}</p>
                                         <span className="text-[8px] font-black text-emerald-500 uppercase">TEA {inv.interestRate}%</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <p className="text-xs font-black text-slate-900">S/. {inv.amount.toLocaleString()}</p>
                                     <button onClick={() => handleDeleteInv(inv.id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                                         <Trash2 size={14} />
                                     </button>
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex justify-between items-center">
                <div>
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">En 1 año tendrías:</p>
                    <p className="text-lg font-black text-emerald-700">S/. {projection.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <TrendingUp size={24} className="text-emerald-400" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsStrategy;
