
import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Wallet, Landmark, Wifi, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Account } from '../types';
import Mascot from './Mascot';

interface AccountsWidgetProps {
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const AccountsWidget: React.FC<AccountsWidgetProps> = ({ accounts, onAddAccount, onTransfer }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'CASH'|'BANK'|'CREDIT'|'INVESTMENT'>('BANK');
  const [newAccBalance, setNewAccBalance] = useState('');

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const totalWealth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount({
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance),
      color: newAccType === 'BANK' ? 'bg-slate-900' : 'bg-emerald-600',
      icon: newAccType === 'BANK' ? 'bank' : 'wallet'
    });
    setShowAdd(false);
    setNewAccName('');
    setNewAccBalance('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId && toId && transferAmount) {
      onTransfer(fromId, toId, parseFloat(transferAmount));
      setShowTransfer(false);
      setTransferAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Patrimony Header (Desktop) */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Landmark size={150} />
        </div>
        <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Patrimonio Total</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-brand-500 transition-colors">
                      {showBalance ? <Eye size={16}/> : <EyeOff size={16}/>}
                  </button>
              </div>
              <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter">
                  {showBalance ? `S/. ${totalWealth.toLocaleString()}` : '••••••••'}
              </h2>
            </div>
            <div className="flex gap-4">
                <button onClick={() => setShowTransfer(true)} className="px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-100 transition-all">
                    <ArrowRightLeft size={18} /> Transferir
                </button>
                <button onClick={() => setShowAdd(true)} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
                    <Plus size={18} /> Nueva Cuenta
                </button>
            </div>
        </div>
      </div>

      {/* Accounts Grid / Slider */}
      <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 px-1 -mx-1 snap-x no-scrollbar">
            {accounts.length === 0 ? (
                <div className="min-w-[280px] lg:min-w-0 h-[180px] lg:h-[230px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setShowAdd(true)}>
                    <p className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest">Agreguemos tu primera cuenta</p>
                    <Plus size={24} />
                </div>
            ) : (
                <>
                {accounts.map(acc => (
                    <div key={acc.id} className="min-w-[280px] lg:min-w-0 h-[180px] lg:h-[220px] rounded-[2rem] lg:rounded-[2.5rem] relative overflow-hidden shadow-lg lg:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-center group">
                        <div className={`absolute inset-0 ${
                            acc.type === 'BANK' 
                            ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' 
                            : acc.type === 'CREDIT' 
                                ? 'bg-gradient-to-br from-indigo-600 via-brand-600 to-brand-900'
                                : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800'
                        }`}></div>
                        
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

                        <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-between h-full text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-7 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 relative">
                                        <div className="absolute top-1/2 left-2 w-2 h-2 border border-white/40 rounded-full -translate-y-1/2"></div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{acc.type}</span>
                                </div>
                                <Wifi size={14} className="rotate-90 opacity-40" />
                            </div>

                            <div>
                                <p className="text-[9px] font-mono opacity-40 tracking-[0.2em] mb-1">•••• {acc.id.substring(0,4)}</p>
                                <h3 className="font-heading font-black text-2xl lg:text-3xl tracking-tight">
                                    {showBalance ? `S/. ${acc.balance.toLocaleString()}` : '••••••••'}
                                </h3>
                                <p className="font-heading font-bold text-[10px] lg:text-xs tracking-widest uppercase mt-2 opacity-80">{acc.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Mobile Quick Add Link */}
                <button onClick={() => setShowAdd(true)} className="lg:hidden min-w-[100px] h-[180px] bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 active:bg-slate-200 transition-colors">
                    <Plus size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nueva</span>
                </button>
                </>
            )}
      </div>

      {(showAdd || showTransfer) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={() => {setShowAdd(false); setShowTransfer(false);}}>
            <div className="bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] p-8 pb-12 lg:pb-8 w-full max-w-lg animate-slide-up lg:animate-pop-in shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 lg:hidden"></div>
                {showAdd && (
                    <form onSubmit={handleAddSubmit} className="space-y-6">
                        <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-1">Nueva Cuenta</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Configura tu fondo</p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre (Ej. BCP Sueldo)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" value={newAccName} onChange={e => setNewAccName(e.target.value)} required />
                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none" value={newAccType} onChange={(e: any) => setNewAccType(e.target.value)}>
                                <option value="BANK">Banco / Cuenta Corriente</option>
                                <option value="CASH">Efectivo / Billetera</option>
                                <option value="CREDIT">Tarjeta de Crédito</option>
                                <option value="INVESTMENT">Cuenta de Inversión</option>
                            </select>
                            <input type="number" step="0.01" placeholder="Monto Inicial" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Crear Cuenta</button>
                    </form>
                )}
                {showTransfer && (
                     <form onSubmit={handleTransferSubmit} className="space-y-6">
                         <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-1">Transferir</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Entre tus propias cuentas</p>
                        </div>
                        <div className="space-y-4">
                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none" value={fromId} onChange={e => setFromId(e.target.value)} required>
                                <option value="">Origen...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (S/. {a.balance})</option>)}
                            </select>
                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none" value={toId} onChange={e => setToId(e.target.value)} required>
                                <option value="">Destino...</option>
                                {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <input type="number" step="0.01" placeholder="Monto S/." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Ejecutar Transferencia</button>
                     </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountsWidget;
