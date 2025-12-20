
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Plus, Trash2, Gem, LineChart, Coins, Info, Sparkles, Landmark, Wallet, ArrowUpRight, Search, RefreshCw } from 'lucide-react';
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

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta inversión de tu trackeo?')) {
      await transactionService.deleteInvestment(userId, id);
      loadInvestments();
    }
  };

  const totals = useMemo(() => {
    const totalInv = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalAcc = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const annualGains = investments.reduce((sum, inv) => {
        return sum + (inv.amount * (inv.interestRate / 100));
    }, 0);
    return { totalInv, totalAcc, annualGains, monthlyGains: annualGains / 12 };
  }, [investments, accounts]);

  const askFinnyAboutInvestments = async () => {
      setAnalyzing(true);
      try {
          const resp = await chatWithFinancialAdvisor(
              [], 
              "Analiza mi portafolio de inversiones actual. ¿Qué opinas de mis tasas y montos? Dame una sugerencia para ganar más.",
              [], 
              0, 
              investments
          );
          setAiAnalysis(resp);
      } finally {
          setAnalyzing(false);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Header Summary */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <LineChart size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <Gem className="text-amber-400" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Patrimonio en Crecimiento</span>
                  </div>
                  <h2 className="text-4xl font-heading font-black">S/. {(totals.totalInv + totals.totalAcc).toLocaleString()}</h2>
                  <p className="text-slate-400 text-sm mt-1">S/. {totals.totalInv.toLocaleString()} invertidos en activos</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1">Ganancia Mensual Est.</p>
                      <p className="text-xl font-heading font-black text-emerald-400">+ S/. {totals.monthlyGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-1">Rendimiento Anual</p>
                      <p className="text-xl font-heading font-black text-amber-400">S/. {totals.annualGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Investment List */}
          <div className="xl:col-span-7 space-y-6">
              <div className="flex justify-between items-center px-2">
                  <h3 className="font-heading font-black text-2xl text-slate-800">Tus Activos</h3>
                  <button onClick={() => setIsAdding(!isAdding)} className="btn-primary py-2 px-4 text-xs">
                      <Plus size={16} /> Nueva Inversión
                  </button>
              </div>

              {isAdding && (
                  <form onSubmit={handleAdd} className="bg-white rounded-3xl p-6 border-2 border-brand-100 shadow-xl space-y-4 animate-pop-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Activo</label>
                              <input type="text" placeholder="Ej. Plazo Fijo Sueldo" className="input-base text-sm py-2.5" value={name} onChange={e => setName(e.target.value)} required />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institución</label>
                              <input type="text" placeholder="Ej. BCP, Binance..." className="input-base text-sm py-2.5" value={institution} onChange={e => setInstitution(e.target.value)} required />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Activo</label>
                              <select className="input-base text-sm py-2.5" value={type} onChange={e => setType(e.target.value as any)}>
                                  <option value="SAVINGS">Cuenta de Ahorros</option>
                                  <option value="FIXED_TERM">Depósito Plazo Fijo</option>
                                  <option value="STOCKS">Bolsa / ETFs</option>
                                  <option value="CRYPTO">Criptomonedas</option>
                                  <option value="EMERGENCY_FUND">Fondo de Emergencia</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Actual (S/.)</label>
                              <input type="number" step="0.01" className="input-base text-sm py-2.5" value={amount} onChange={e => setAmount(e.target.value)} required />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TEA % (Tasa Anual)</label>
                              <input type="number" step="0.1" className="input-base text-sm py-2.5" value={rate} onChange={e => setRate(e.target.value)} required />
                          </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold text-xs">Cancelar</button>
                          <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-xs">{loading ? 'Guardando...' : 'Confirmar Inversión'}</button>
                      </div>
                  </form>
              )}

              {investments.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
                      <Mascot variant="thinking" size={100} className="mx-auto mb-4 opacity-30" />
                      <p className="text-slate-400 font-bold">No tienes inversiones registradas.</p>
                      <button onClick={() => setIsAdding(true)} className="text-brand-600 font-black text-sm mt-1 hover:underline">Empieza a trackear tus ganancias hoy</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {investments.map(inv => (
                          <div key={inv.id} className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between group hover:border-brand-300 transition-all hover:shadow-lg">
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${inv.interestRate >= 6 ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                      {inv.type === 'CRYPTO' ? '₿' : inv.type === 'STOCKS' ? <TrendingUp size={24}/> : <Landmark size={24}/>}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">{inv.name}</h4>
                                      <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500 uppercase">{inv.institution}</span>
                                          <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black">TEA {inv.interestRate}%</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right flex items-center gap-6">
                                  <div>
                                      <p className="text-lg font-black text-slate-900">S/. {inv.amount.toLocaleString()}</p>
                                      <p className="text-[10px] text-emerald-500 font-bold">+ S/. {(inv.amount * (inv.interestRate/100) / 12).toFixed(2)} / mes</p>
                                  </div>
                                  <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Right: AI Analysis & Strategy */}
          <div className="xl:col-span-5 space-y-6">
              {/* Finny Analysis Panel */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                          <Mascot variant="happy" size={60} />
                          <div>
                              <h3 className="font-heading font-black text-lg">Asistente de Inversión</h3>
                              <p className="text-indigo-200 text-xs">Análisis de portafolio potenciado por IA</p>
                          </div>
                      </div>

                      {aiAnalysis ? (
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm leading-relaxed border border-white/10 animate-fade-in">
                              <div className="prose prose-invert prose-sm">
                                  {aiAnalysis}
                              </div>
                              <button onClick={() => setAiAnalysis(null)} className="mt-4 text-[10px] font-bold text-indigo-200 hover:text-white flex items-center gap-1">
                                  <RefreshCw size={10} /> Nuevo análisis
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <p className="text-sm text-indigo-100">Finny puede analizar tus tasas y decirte si tu dinero está rindiendo lo suficiente.</p>
                              <button 
                                onClick={askFinnyAboutInvestments} 
                                disabled={analyzing || investments.length === 0}
                                className="w-full py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                              >
                                  {analyzing ? (
                                      <><Sparkles className="animate-pulse" /> Analizando...</>
                                  ) : (
                                      <><Search size={20} /> Analizar mis Inversiones</>
                                  )}
                              </button>
                          </div>
                      )}
                  </div>
              </div>

              {/* Investment Concepts */}
              <Card className="p-6 border-slate-200">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">¿Por qué invertir?</h4>
                  <div className="space-y-4">
                      <div className="flex gap-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                              <TrendingUp size={20} />
                          </div>
                          <div>
                              <p className="text-sm font-bold text-slate-800">Vence a la Inflación</p>
                              <p className="text-xs text-slate-500">Si tu dinero no crece al menos un 4-5% anual, estás perdiendo poder de compra cada año.</p>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                              <Coins size={20} />
                          </div>
                          <div>
                              <p className="text-sm font-bold text-slate-800">Ingresos Pasivos</p>
                              <p className="text-xs text-slate-500">Es dinero que ganas sin trabajar. S/. 1,000 en un plazo fijo de 8% te da S/. 80 anuales "gratis".</p>
                          </div>
                      </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default AssetsView;
