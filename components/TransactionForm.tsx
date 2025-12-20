
import React, { useState, useEffect } from 'react';
import { X, Check, Camera, AlertTriangle, ChevronDown } from 'lucide-react';
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
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
      if (isOpen) {
          const loadAccs = async () => {
              const accs = await transactionService.getAccounts(userId);
              setAccounts(accs);
              if (accs.length > 0 && !accountId) setAccountId(accs[0].id);
          };
          loadAccs();
      }
  }, [userId, isOpen]);

  useEffect(() => {
      if (amount && description) {
          const check = async () => {
              const dup = await transactionService.checkPossibleDuplicate(userId, parseFloat(amount), description);
              setIsDuplicate(dup);
          };
          const timeout = setTimeout(check, 500);
          return () => clearTimeout(timeout);
      }
  }, [amount, description, userId]);

  const handleOCR = () => {
      setScanning(true);
      setTimeout(() => {
          setAmount('45.50');
          setDescription('Supermercado Metro');
          setCategory(Category.FOOD);
          setIsFixed(false);
          setScanning(false);
      }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    let finalDesc = description;
    let finalCat = category;

    if (type === TransactionType.INCOME) {
      finalDesc = description || (isFixed ? 'Ingreso Recurrente' : 'Ingreso Extra');
      finalCat = isFixed ? Category.FIXED_INCOME : Category.VARIABLE_INCOME;
    } else {
       finalDesc = description || category;
    }

    onAddTransaction({
      amount: parseFloat(amount),
      description: finalDesc,
      type,
      category: finalCat,
      date,
      isFixed,
      accountId
    });

    setTimeout(() => {
        setAmount('');
        setDescription('');
        setIsSubmitting(false);
        setIsDuplicate(false);
        onClose();
    }, 300);
  };

  const categories = Object.values(Category).filter(c => 
     c !== Category.FIXED_INCOME && c !== Category.VARIABLE_INCOME && c !== Category.TRANSFER_IN && c !== Category.TRANSFER_OUT
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
       <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
       
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
       
       <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col max-h-[95vh] z-10 relative overflow-hidden">
          
          {/* Drag Handle for Mobile Feel */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0"></div>

          <div className="flex justify-between items-center px-6 py-2">
             <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={24} strokeWidth={2.5} /></button>
             <div className="flex gap-1 bg-slate-100 p-1 rounded-full">
                <button onClick={() => setType(TransactionType.EXPENSE)} className={`px-5 py-2 rounded-full text-xs font-black transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Gasto</button>
                <button onClick={() => setType(TransactionType.INCOME)} className={`px-5 py-2 rounded-full text-xs font-black transition-all ${type === TransactionType.INCOME ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Ingreso</button>
             </div>
             <button onClick={handleOCR} className={`p-2 rounded-full text-brand-500 hover:bg-brand-50 transition-colors ${scanning ? 'animate-pulse' : ''}`}>
                 <Camera size={24} strokeWidth={2.5} />
             </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              
              <div className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-1">
                      <span className={`text-2xl font-heading font-black ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}>S/.</span>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        step="0.01" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className={`text-5xl md:text-6xl font-heading font-black bg-transparent w-full max-w-[240px] text-center outline-none placeholder-slate-200 ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-emerald-500'}`}
                        autoFocus
                      />
                  </div>
                  {scanning && <p className="text-[10px] text-brand-500 font-black mt-2 animate-pulse uppercase tracking-widest">Escaneando Recibo...</p>}
                  {isDuplicate && (
                      <div className="mt-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-shake">
                          <AlertTriangle size={14} /> Posible Duplicado
                      </div>
                  )}
              </div>

              <div className="bg-slate-50 flex-1 rounded-t-[2.5rem] p-6 space-y-5">
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1.5 block">Fecha</label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white rounded-2xl p-4 text-sm font-bold border border-slate-100 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1.5 block">Cuenta</label>
                          <div className="relative">
                            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-white rounded-2xl p-4 text-sm font-bold border border-slate-100 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all appearance-none pr-10">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                          </div>
                      </div>
                  </div>

                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1.5 block">Descripción</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="¿En qué lo gastaste?" className="w-full bg-white rounded-2xl p-4 text-sm font-bold border border-slate-100 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" />
                  </div>

                  {type === TransactionType.EXPENSE && (
                      <div className="animate-fade-in">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2.5 block">Categoría</label>
                          <div className="flex flex-wrap gap-2">
                              {categories.map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${category === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-transparent hover:border-slate-200'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 mb-4">
                      <span className="text-xs font-bold text-slate-500">¿Es {type === TransactionType.EXPENSE ? 'gasto' : 'ingreso'} recurrente?</span>
                      <div className="flex bg-slate-100 rounded-xl p-1">
                          <button type="button" onClick={() => setIsFixed(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${isFixed ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}>SÍ</button>
                          <button type="button" onClick={() => setIsFixed(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isFixed ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400'}`}>NO</button>
                      </div>
                  </div>
              </div>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 pb-safe">
              <button 
                type="submit"
                form="tx-form"
                disabled={isSubmitting || !amount}
                className={`w-full py-4 rounded-[1.5rem] font-heading font-black text-white text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-2 ${type === TransactionType.EXPENSE ? 'bg-slate-900 shadow-slate-900/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
              >
                  {isSubmitting ? 'Guardando...' : <><Check size={24} strokeWidth={3} /> Registrar Movimiento</>}
              </button>
          </div>
       </div>
    </div>
  );
};

export default TransactionForm;
