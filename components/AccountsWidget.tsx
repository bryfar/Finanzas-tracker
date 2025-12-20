
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
      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Landmark size={150} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mb-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Patrimonio Total</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-brand-500 transition-colors">
                      {showBalance ? <Eye size={16}/> : <EyeOff size={16}/>}
                  </button>
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-black text-slate-900 tracking-tighter">
                  {showBalance ? `S/. ${totalWealth.toLocaleString()}` : '••••••••'}
              </h2>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={() => setShowTransfer(!showTransfer)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95"
                >
                    <ArrowRightLeft size={18} strokeWidth={2.5} />
                    <span>Transferir</span>
                </button>
                <button 
                    onClick={() => setShowAdd(!showAdd)} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Agregar</span>
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.length === 0 && (
                <div className="h-[230px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 gap-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all group" onClick={() => setShowAdd(true)}>
                    <Mascot variant="happy" size={70} className="group-hover:scale-110 transition-transform" />
                    <p className="font-heading font-bold text-slate-500">¿Agregamos tu primera cuenta?</p>
                </div>
            )}

            {accounts.map(acc => (
            <div key={acc.id} className="h-[230px] rounded-[2.5rem] relative overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-default">
                <div className={`absolute inset-0 ${
                    acc.type === 'BANK' 
                    ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' 
                    : acc.type === 'CREDIT' 
                        ? 'bg-gradient-to-br from-indigo-600 via-brand-600 to-brand-900'
                        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800'
                }`}></div>
                
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

                <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-9 bg-yellow-200/20 backdrop-blur-md rounded-lg border border-white/20 relative overflow-hidden">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/10"></div>
                                <div className="absolute top-1/2 left-2 w-3 h-3 border border-white/20 rounded-full -translate-y-1/2"></div>
                            </div>
                            <Wifi size={18} className="rotate-90 opacity-40" />
                        </div>
                        <span className="font-heading font-black italic opacity-20 text-2xl uppercase tracking-widest">{acc.type}</span>
                    </div>

                    <div className="space-y-1">
                        <p className="font-mono text-[10px] opacity-40 tracking-[0.3em] mb-1">••••  ••••  ••••  {acc.id.substring(0,4)}</p>
                        <h3 className="font-heading font-black text-4xl tracking-tight">
                            {showBalance ? `S/. ${acc.balance.toLocaleString()}` : '••••••••'}
                        </h3>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[8px] font-black opacity-50 uppercase tracking-[0.2em] mb-1">TITULAR</p>
                            <p className="font-heading font-black text-sm tracking-widest uppercase truncate max-w-[180px]">{acc.name}</p>
                        </div>
                        <div className="opacity-80 group-hover:scale-110 transition-transform">
                            {acc.type === 'BANK' ? <Landmark size={32} /> : <Wallet size={32} />}
                        </div>
                    </div>
                </div>
            </div>
            ))}
      </div>

      {(showAdd || showTransfer) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => {setShowAdd(false); setShowTransfer(false);}}>
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm animate-pop-in shadow-2xl" onClick={e => e.stopPropagation()}>
                {showAdd && (
                    <form onSubmit={handleAddSubmit} className="space-y-6">
                        <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-2">Nueva Cuenta</h4>
                            <p className="text-slate-400 text-sm font-medium">Registra tus medios de pago</p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre (Ej. BCP Sueldo)" className="input-base" value={newAccName} onChange={e => setNewAccName(e.target.value)} required />
                            <select className="input-base" value={newAccType} onChange={(e: any) => setNewAccType(e.target.value)}>
                                <option value="BANK">Banco</option>
                                <option value="CASH">Efectivo</option>
                                <option value="CREDIT">Crédito</option>
                                <option value="INVESTMENT">Inversión</option>
                            </select>
                            <input type="number" step="0.01" placeholder="Monto Inicial" className="input-base" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full btn-primary py-4 text-lg">Guardar Cuenta</button>
                    </form>
                )}
                {showTransfer && (
                     <form onSubmit={handleTransferSubmit} className="space-y-6">
                         <div className="text-center">
                            <h4 className="font-heading font-black text-2xl text-slate-900 mb-2">Transferencia</h4>
                            <p className="text-slate-400 text-sm font-medium">Movimiento entre cuentas</p>
                        </div>
                        <div className="space-y-4">
                            <select className="input-base" value={fromId} onChange={e => setFromId(e.target.value)} required>
                                <option value="">Desde...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (S/. {a.balance})</option>)}
                            </select>
                            <select className="input-base" value={toId} onChange={e => setToId(e.target.value)} required>
                                <option value="">Para...</option>
                                {accounts.filter(a => a.id !== fromId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            <input type="number" step="0.01" placeholder="Monto a transferir" className="input-base" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full btn-primary py-4 text-lg">Realizar Transferencia</button>
                     </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountsWidget;
