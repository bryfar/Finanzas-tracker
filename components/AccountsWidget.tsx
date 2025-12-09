import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Wallet, Landmark, Wifi, Eye, EyeOff } from 'lucide-react';
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
  
  // New Account State
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'CASH'|'BANK'>('BANK');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Transfer State
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
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header Summary */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-soft border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <Landmark size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest">Patrimonio Total</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-brand-500 transition-colors p-1">
                      {showBalance ? <Eye size={14}/> : <EyeOff size={14}/>}
                  </button>
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight">
                  {showBalance ? `S/. ${totalWealth.toLocaleString()}` : '••••••••'}
              </h2>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => setShowTransfer(!showTransfer)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all"
                >
                    <ArrowRightLeft size={16} strokeWidth={2.5} />
                    <span>Transferir</span>
                </button>
                <button 
                    onClick={() => setShowAdd(!showAdd)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span>Agregar</span>
                </button>
            </div>
        </div>
      </div>

      {/* Forms Modal Overlay */}
      {(showAdd || showTransfer) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => {setShowAdd(false); setShowTransfer(false);}}>
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm animate-pop-in relative shadow-2xl" onClick={e => e.stopPropagation()}>
                
                {showAdd && (
                    <form onSubmit={handleAddSubmit} className="space-y-6">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Landmark size={28} />
                            </div>
                            <h4 className="font-heading font-black text-2xl text-slate-900">Nueva Cuenta</h4>
                            <p className="text-slate-400 text-sm font-medium">Registra una cuenta de banco o efectivo</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-1 block">Nombre</label>
                                <input type="text" placeholder="Ej. BCP Ahorros" className="input-base" value={newAccName} onChange={e => setNewAccName(e.target.value)} required autoFocus />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-1 block">Tipo</label>
                                    <div className="relative">
                                      <select className="input-base appearance-none" value={newAccType} onChange={(e: any) => setNewAccType(e.target.value)}>
                                          <option value="BANK">Banco</option>
                                          <option value="CASH">Efectivo</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-1 block">Saldo</label>
                                    <input type="number" step="0.01" placeholder="0.00" className="input-base" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full btn-primary py-4 text-lg">Crear Cuenta</button>
                    </form>
                )}

                {showTransfer && (
                     <form onSubmit={handleTransferSubmit} className="space-y-6">
                         <div className="text-center">
                            <div className="w-14 h-14 bg-action-light text-action rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <ArrowRightLeft size={28} />
                            </div>
                            <h4 className="font-heading font-black text-2xl text-slate-900">Transferir</h4>
                            <p className="text-slate-400 text-sm font-medium">Mueve dinero entre tus cuentas</p>
                        </div>

                         <div className="flex flex-col gap-4 relative">
                             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-colors focus-within:bg-white focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-500/10">
                                <label className="text-[10px] text-slate-400 font-bold uppercase pl-1">Desde</label>
                                <select className="w-full bg-transparent font-heading font-bold text-slate-700 outline-none mt-1 text-lg appearance-none" value={fromId} onChange={e => setFromId(e.target.value)} required>
                                    <option value="">Seleccionar...</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (S/. {a.balance})</option>)}
                                </select>
                             </div>
                             
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 z-10 shadow-sm">
                                <ArrowRightLeft size={16} />
                             </div>

                             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-colors focus-within:bg-white focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-500/10">
                                <label className="text-[10px] text-slate-400 font-bold uppercase pl-1">Para</label>
                                <select className="w-full bg-transparent font-heading font-bold text-slate-700 outline-none mt-1 text-lg appearance-none" value={toId} onChange={e => setToId(e.target.value)} required>
                                    <option value="">Seleccionar...</option>
                                    {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                             </div>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-1 block">Monto</label>
                            <div className="relative mt-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-black text-slate-300 text-xl">S/.</span>
                                <input type="number" step="0.01" placeholder="0.00" className="input-base pl-12 text-2xl font-black" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required />
                            </div>
                         </div>
                         <button type="submit" className="w-full btn-action py-4 text-lg">Confirmar</button>
                     </form>
                )}
            </div>
        </div>
      )}

      {/* Cards Carousel */}
      <div className="w-full overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto gap-4 pb-8 pt-2 snap-x snap-mandatory custom-scrollbar pr-4">
            
            {accounts.length === 0 && (
                <div className="w-full sm:w-[340px] h-[210px] flex-shrink-0 snap-center p-8 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setShowAdd(true)}>
                    <div className="opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300">
                        <Mascot variant="happy" size={60} />
                    </div>
                    <div>
                        <p className="font-heading font-bold text-slate-500">Sin cuentas</p>
                        <p className="text-xs text-brand-500 font-bold mt-1">¡Toca para agregar!</p>
                    </div>
                </div>
            )}

            {accounts.map(acc => (
            <div key={acc.id} className="flex-shrink-0 snap-center w-[85vw] sm:w-[360px] h-[210px] rounded-[2.5rem] relative overflow-hidden shadow-xl transition-all hover:-translate-y-2 duration-300 group select-none cursor-pointer">
                
                {/* Dynamic Backgrounds based on Type */}
                <div className={`absolute inset-0 ${
                    acc.type === 'BANK' 
                    ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' 
                    : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800'
                }`}></div>
                
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                
                {/* Decorative Circles */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>

                <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-8 bg-yellow-200/20 backdrop-blur-md rounded-lg border border-yellow-200/30 relative overflow-hidden shadow-sm">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                                <div className="absolute top-1/2 left-2 w-3 h-3 border border-black/20 rounded-full -translate-y-1/2"></div>
                            </div>
                            <Wifi size={20} className="rotate-90 opacity-60" strokeWidth={3} />
                        </div>
                        <span className="font-heading font-black italic opacity-40 text-xl tracking-wider">{acc.type === 'BANK' ? 'BANK' : 'CASH'}</span>
                    </div>

                    <div className="space-y-1">
                        <p className="font-mono text-xs opacity-60 tracking-[0.2em] mb-1">••••  ••••  ••••  {acc.id.substring(0,4)}</p>
                        <h3 className="font-heading font-black text-3xl tracking-tight text-white drop-shadow-md">
                            {showBalance ? `S/. ${acc.balance.toLocaleString()}` : '••••••••'}
                        </h3>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest mb-0.5">TITULAR</p>
                            <p className="font-heading font-bold text-sm tracking-widest uppercase truncate max-w-[180px]">{acc.name}</p>
                        </div>
                        <div className="opacity-90">
                            {acc.type === 'BANK' ? <Landmark size={28} strokeWidth={1.5} /> : <Wallet size={28} strokeWidth={1.5} />}
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsWidget;