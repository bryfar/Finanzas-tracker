
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Plus, Trash2, Gem, LineChart, Coins, Landmark, ArrowUpRight, Search, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { Investment, Account } from '../types';
import { transactionService } from '../services/transactionService';
import { chatWithFinancialAdvisor } from '../services/geminiService';
import { Card } from './ui/Card';
import Mascot from './Mascot';

interface AssetsViewProps {
  accounts: Account[];
  userId: string;
}

const AssetsView: React.FC<AssetsViewProps> = ({ accounts, userId }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Investment['type']>('SAVINGS');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    loadInvestments();
  }, [userId]);

  const loadInvestments = async () => {
    const data = await transactionService.getInvestments(userId);
    setInvestments(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionService.addInvestment(userId, {
        name,
        type,
        amount: parseFloat(amount),
        interestRate: parseFloat(rate),
        institution,
        startDate: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      setName(''); setAmount(''); setRate(''); setInstitution('');
      loadInvestments();
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const totalInv = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalAcc = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const annualGains = investments.reduce((sum, inv) => sum + (inv.amount * (inv.interestRate / 100)), 0);
    return { 
      totalInv, 
      totalAcc, 
      netWorth: totalInv + totalAcc,
      annualGains, 
      monthlyGains: annualGains / 12 
    };
  }, [investments, accounts]);

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* Net Worth Hero Card */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-12 -translate-y-12">
              <Landmark size={280} />
          </div>
          <div className="relative z-10 space-y-8">
              <div>
                  <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Patrimonio Neto</span>
                  </div>
                  <h2 className="text-6xl font-heading font-black tracking-tight leading-none">S/. {totals.netWorth.toLocaleString()}</h2>
                  <p className="text-slate-400 font-bold text-sm mt-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" /> S/. {totals.totalInv.toLocaleString()} en activos productivos
                  </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/10 shadow-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Calculadora Rendimiento Mensual</p>
                      <p className="text-2xl font-heading font-black text-white">+ S/. {totals.monthlyGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Dinero generado "durmiendo"</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/10 shadow-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2">Interés Anual Estimado</p>
                      <p className="text-2xl font-heading font-black text-white">S/. {totals.annualGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Basado en tasas TEA registradas</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center px-2">
                  <h3 className="font-heading font-black text-2xl text-slate-800">Inversiones Activas</h3>
                  <button onClick={() => setIsAdding(!isAdding)} className="w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                      <Plus size={20} strokeWidth={3} />
                  </button>
              </div>

              {isAdding && (
                  <form onSubmit={handleAdd} className="bg-white rounded-[2.5rem] p-8 border-2 border-brand-100 shadow-2xl space-y-6 animate-pop-in">
                      <div className="grid grid-cols-1 gap-4">
                          <input type="text" placeholder="Nombre (Ej. Plazo Fijo BCP)" className="input-mobile !bg-slate-50" value={name} onChange={e => setName(e.target.value)} required />
                          <div className="grid grid-cols-2 gap-4">
                              <select className="input-mobile !bg-slate-50 appearance-none" value={type} onChange={e => setType(e.target.value as any)}>
                                  <option value="SAVINGS">Cuenta Ahorros</option>
                                  <option value="FIXED_TERM">Plazo Fijo</option>
                                  <option value="CRYPTO">Criptomonedas</option>
                                  <option value="STOCKS">Bolsa / ETFs</option>
                              </select>
                              <input type="number" step="0.1" placeholder="TEA %" className="input-mobile !bg-slate-50" value={rate} onChange={e => setRate(e.target.value)} required />
                          </div>
                          <input type="number" step="0.01" placeholder="Monto Actual S/." className="input-mobile !bg-slate-50" value={amount} onChange={e => setAmount(e.target.value)} required />
                      </div>
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
                          <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl">{loading ? 'Procesando...' : 'Añadir Activo'}</button>
                      </div>
                  </form>
              )}

              <div className="space-y-4">
                  {investments.length === 0 ? (
                      <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-100">
                          <Mascot variant="thinking" size={100} className="mx-auto mb-6 opacity-30 grayscale" />
                          <p className="text-slate-400 font-bold text-sm">No tienes inversiones registradas.</p>
                          <button onClick={() => setIsAdding(true)} className="text-brand-600 font-black text-[10px] uppercase tracking-widest mt-4 hover:underline">Empieza a trackear tu riqueza</button>
                      </div>
                  ) : (
                      investments.map(inv => (
                          <div key={inv.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all active:scale-[0.99]">
                              <div className="flex items-center gap-5">
                                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg ${inv.interestRate >= 6 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-800 shadow-slate-200'}`}>
                                      {inv.type === 'CRYPTO' ? '₿' : inv.type === 'STOCKS' ? <TrendingUp size={24}/> : <Landmark size={24}/>}
                                  </div>
                                  <div>
                                      <h4 className="font-heading font-black text-slate-800">{inv.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-md font-black text-slate-500 uppercase tracking-widest">{inv.type}</span>
                                          <span className="text-[9px] bg-brand-50 text-brand-600 px-2 py-1 rounded-md font-black uppercase tracking-widest">TEA {inv.interestRate}%</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-lg font-heading font-black text-slate-900">S/. {inv.amount.toLocaleString()}</p>
                                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">+ S/. {(inv.amount * (inv.interestRate/100) / 12).toFixed(2)} mes</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
              {/* IA Portfolio Advisor */}
              <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Mascot variant="happy" size={150} />
                  </div>
                  <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Sparkles size={20} className="text-amber-300" />
                          </div>
                          <h3 className="font-heading font-black text-lg">Portfolio Advisor</h3>
                      </div>
                      <p className="text-xs text-brand-100 font-medium leading-relaxed">¿Estás diversificando correctamente? Finny analiza tus tasas contra el mercado peruano.</p>
                      
                      <button 
                        onClick={async () => {
                            setAnalyzing(true);
                            const resp = await chatWithFinancialAdvisor([], "Analiza mi portafolio actual. ¿Mis tasas TEA son competitivas? ¿Qué me recomiendas para crecer?", [], 0, investments);
                            setAiAnalysis(resp);
                            setAnalyzing(false);
                        }}
                        className="w-full py-4 bg-white text-brand-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-700/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                         {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} strokeWidth={3} />}
                         {analyzing ? 'Analizando...' : 'Analizar Portafolio'}
                      </button>
                  </div>
              </div>

              {aiAnalysis && (
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft animate-pop-in">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Consejo de Finny</span>
                        <button onClick={() => setAiAnalysis(null)} className="text-slate-300 hover:text-slate-500"><Trash2 size={16}/></button>
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed prose prose-sm">
                          {aiAnalysis}
                      </div>
                  </div>
              )}

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-soft space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Estrategia de Activos
                  </h4>
                  <div className="space-y-4">
                      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                              <Coins size={20} />
                          </div>
                          <div>
                              <p className="text-xs font-black text-slate-800 mb-1">Interés Compuesto</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Reinvierte tus ganancias para que generen más dinero exponencialmente.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AssetsView;
