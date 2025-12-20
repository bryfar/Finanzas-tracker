
import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Landmark, Wifi, Eye, EyeOff } from 'lucide-react';
import { Account } from '../types';

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount({
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance),
      color: 'bg-slate-900',
      icon: 'bank'
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
      <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-black text-xl text-slate-900">Mis Cuentas</h3>
          <button onClick={() => setShowBalance(!showBalance)} className="p-2 text-slate-300 active:scale-90 transition-transform">
              {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x px-1">
            {accounts.length === 0 ? (
                <div 
                    className="w-full shrink-0 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all snap-center"
                    onClick={() => setShowAdd(true)}
                >
                    <p className="font-heading font-bold text-xs text-slate-500 uppercase tracking-widest text-center mb-4">Agreguemos tu primera cuenta</p>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                        <Plus size={24} />
                    </div>
                </div>
            ) : (
                <>
                {accounts.map(acc => (
                    <div key={acc.id} className="min-w-[85vw] lg:min-w-[320px] h-[200px] rounded-[2.5rem] relative overflow-hidden shadow-xl snap-center transition-transform active:scale-[0.98]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${acc.type === 'BANK' ? 'from-slate-800 to-black' : 'from-brand-600 to-indigo-900'}`}></div>
                        <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{acc.type}</span>
                                </div>
                                <Wifi size={16} className="rotate-90 opacity-40" />
                            </div>
                            <div>
                                <h3 className="font-heading font-black text-3xl tracking-tight mb-1">
                                    {showBalance ? `S/. ${acc.balance.toLocaleString()}` : '••••••••'}
                                </h3>
                                <p className="font-heading font-bold text-xs tracking-widest uppercase opacity-80">{acc.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => setShowAdd(true)}
                    className="min-w-[140px] h-[200px] bg-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-400 active:bg-slate-200 transition-colors snap-center"
                >
                    <Plus size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nueva</span>
                </button>
                </>
            )}
      </div>

      {(showAdd || showTransfer) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end justify-center px-safe" onClick={() => {setShowAdd(false); setShowTransfer(false);}}>
            <div className="bottom-sheet bottom-sheet-open w-full max-w-2xl px-8 pb-12" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-8"></div>
                {showAdd ? (
                    <form onSubmit={handleAddSubmit} className="space-y-6">
                        <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-2">Añadir Cuenta</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">¿Dónde guardas tu dinero?</p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre (Ej. BCP Sueldo)" className="input-mobile" value={newAccName} onChange={e => setNewAccName(e.target.value)} required />
                            <select className="input-mobile appearance-none" value={newAccType} onChange={(e: any) => setNewAccType(e.target.value)}>
                                <option value="BANK">Banco / Ahorros</option>
                                <option value="CASH">Billetera / Efectivo</option>
                                <option value="CREDIT">Tarjeta de Crédito</option>
                            </select>
                            <input type="number" step="0.01" placeholder="Monto Inicial" className="input-mobile" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-heading font-black text-lg shadow-2xl active:scale-95 transition-all">Crear Cuenta</button>
                    </form>
                ) : (
                    <form onSubmit={handleTransferSubmit} className="space-y-6">
                         <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-2">Transferir</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Movimiento entre cuentas</p>
                        </div>
                        <div className="space-y-4">
                            <select className="input-mobile appearance-none" value={fromId} onChange={e => setFromId(e.target.value)} required>
                                <option value="">Desde...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <select className="input-mobile appearance-none" value={toId} onChange={e => setToId(e.target.value)} required>
                                <option value="">Hacia...</option>
                                {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <input type="number" step="0.01" placeholder="Monto S/." className="input-mobile" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full py-5 bg-brand-600 text-white rounded-[1.8rem] font-heading font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                            <ArrowRightLeft size={24} /> Confirmar Transferencia
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountsWidget;
