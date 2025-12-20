
import React, { useState, useEffect } from 'react';
import { X, Check, Wallet, Grid, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType, Category, Account } from '../types';
import { transactionService } from '../services/transactionService';
import { getCategoryIcon, getCategoryStyle } from '../data/categories';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  userId: string;
  onClose: () => void;
  isOpen: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, userId, onClose, isOpen }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      transactionService.getAccounts(userId).then(accs => {
        setAccounts(accs);
        if (accs.length > 0 && !accountId) setAccountId(accs[0].id);
      });
    }
  }, [userId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;
    setIsSubmitting(true);
    
    onAddTransaction({
      amount: parseFloat(amount),
      description: description || category,
      type,
      category: type === TransactionType.INCOME ? Category.FIXED_INCOME : category,
      date,
      isFixed,
      accountId
    });

    setTimeout(() => {
      setAmount('');
      setDescription('');
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-safe animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bottom-sheet bottom-sheet-open w-full max-w-2xl bg-white rounded-t-[3rem] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>

        {/* Header Section */}
        <div className="flex justify-between items-center px-8 py-4 shrink-0">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl active:scale-90 transition-transform">
            <X size={20} strokeWidth={3} />
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shadow-inner border border-slate-200/50">
            <button 
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)} 
              className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${type === TransactionType.EXPENSE ? 'bg-white text-rose-500 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Gasto
            </button>
            <button 
              type="button"
              onClick={() => setType(TransactionType.INCOME)} 
              className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Ingreso
            </button>
          </div>

          <div className="w-10 h-10"></div> {/* Spacer for symmetry */}
        </div>

        {/* Amount Input Section */}
        <div className="py-8 px-8 text-center shrink-0">
            <div className="flex items-center justify-center gap-3">
                <span className={`text-4xl font-heading font-black transition-colors duration-500 ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}>
                  S/.
                </span>
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`text-7xl font-heading font-black bg-transparent w-full max-w-[320px] outline-none placeholder-slate-100 text-center transition-colors duration-500 ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}
                  autoFocus
                />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-6">Ingresa el monto del movimiento</p>
        </div>

        {/* Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-8 py-4 space-y-8 pb-12">
          
          {/* Main Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> ¿En qué se usó?
              </label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Escribe una descripción opcional..." 
                className="input-mobile !bg-slate-50 !border !border-slate-100 focus:!bg-white focus:!border-brand-200 transition-all text-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-brand-500" /> Fecha
                  </label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-mobile !py-4 !text-xs !bg-slate-50" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Wallet size={12} className="text-brand-500" /> Cuenta
                  </label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccountId(acc.id)}
                        className={`shrink-0 px-4 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${accountId === acc.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200'}`}
                      >
                        {acc.name}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Categories Grid */}
          {type === TransactionType.EXPENSE && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Grid size={12} className="text-brand-500" /> Categoría
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(Category).filter(c => !c.includes('Ingreso') && !c.includes('Transferencia')).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 group ${category === cat ? 'bg-brand-50 border-brand-500 shadow-sm' : 'bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${category === cat ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : getCategoryStyle(cat)}`}>
                      {getCategoryIcon(cat)}
                    </div>
                    <span className={`text-[9px] font-black uppercase text-center truncate w-full ${category === cat ? 'text-brand-600' : 'text-slate-400'}`}>
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recurrence Toggle */}
          <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isFixed ? 'bg-brand-600 text-white shadow-lg' : 'bg-white text-brand-500 border border-slate-100'}`}>
                <Sparkles size={20} className={isFixed ? 'animate-pulse' : ''} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">¿Gasto recurrente?</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Se registrará automáticamente</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsFixed(!isFixed)} 
              className={`w-14 h-8 rounded-full transition-all relative p-1 ${isFixed ? 'bg-brand-600 shadow-lg shadow-brand-500/20' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isFixed ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || !amount}
              className={`group w-full py-6 rounded-[2rem] font-heading font-black text-white text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale ${type === TransactionType.EXPENSE ? 'bg-slate-900 shadow-slate-900/25' : 'bg-brand-600 shadow-brand-600/30'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>GUARDANDO...</span>
                </div>
              ) : (
                <>
                  <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                    <Check size={24} strokeWidth={4} />
                  </div>
                  <span>CONFIRMAR MOVIMIENTO</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-6">Tu balance se actualizará al instante</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
