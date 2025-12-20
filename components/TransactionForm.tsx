
import React, { useState, useEffect } from 'react';
import { X, Check, Camera, AlertTriangle, ChevronDown, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, Category, Account } from '../types';
import { transactionService } from '../services/transactionService';

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
  const [scanning, setScanning] = useState(false);

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose}></div>
      
      <div className="bottom-sheet max-w-xl w-full flex flex-col max-h-[92vh]">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>
        
        <div className="flex justify-between items-center px-6 py-2">
          <button onClick={onClose} className="p-2 text-slate-400 active:scale-90"><X size={24} /></button>
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button onClick={() => setType(TransactionType.EXPENSE)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>Gasto</button>
            <button onClick={() => setType(TransactionType.INCOME)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Ingreso</button>
          </div>
          <button className="p-2 text-brand-500 active:scale-90"><Camera size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar pb-12">
          {/* Monto Hero */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className={`text-3xl font-heading font-black ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}>S/.</span>
              <input 
                type="number" 
                inputMode="decimal"
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={`text-6xl font-heading font-black bg-transparent w-full max-w-[200px] outline-none placeholder-slate-200 ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}
                autoFocus
              />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ingresa el monto del movimiento</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-mobile text-sm" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cuenta</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-mobile text-sm">
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Almuerzo con amigos" className="input-mobile" />
            </div>

            {type === TransactionType.EXPENSE && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {Object.values(Category).filter(c => !c.includes('Ingreso')).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`shrink-0 px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${category === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-3xl flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-brand-500 shadow-sm"><Sparkles size={18} /></div>
                <div>
                  <p className="text-xs font-black text-slate-800">¿Es recurrente?</p>
                  <p className="text-[10px] text-slate-400">Se repetirá todos los meses</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsFixed(!isFixed)} className={`w-12 h-6 rounded-full transition-all relative ${isFixed ? 'bg-brand-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isFixed ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !amount}
            className={`w-full py-5 rounded-2xl font-heading font-black text-white text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${type === TransactionType.EXPENSE ? 'bg-slate-900 shadow-slate-900/20' : 'bg-brand-600 shadow-brand-600/20'}`}
          >
            {isSubmitting ? 'Procesando...' : <><Check size={24} /> Guardar Movimiento</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
