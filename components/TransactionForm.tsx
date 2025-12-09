import React, { useState, useEffect } from 'react';
import { X, Check, Camera, AlertTriangle } from 'lucide-react';
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
  const [isFixed, setIsFixed] = useState<boolean>(true);
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

  // Real-time Duplicate Check
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
      // Simulate OCR Delay & Processing
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

    // Play Coin Sound (Simulated)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
       <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
       
       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
       
       <div className="bg-white w-full max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col max-h-[95vh] z-10 relative overflow-hidden">
          
          <div className="flex justify-between items-center p-6 pb-2">
             <button onClick={onClose} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} strokeWidth={3} /></button>
             <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
                <button onClick={() => setType(TransactionType.EXPENSE)} className={`px-6 py-2 rounded-full text-xs font-heading font-extrabold flex items-center gap-2 transition-all ${type === TransactionType.EXPENSE ? 'bg-danger text-white shadow-lg shadow-danger/30' : 'text-slate-400'}`}>Gasto</button>
                <button onClick={() => setType(TransactionType.INCOME)} className={`px-6 py-2 rounded-full text-xs font-heading font-extrabold flex items-center gap-2 transition-all ${type === TransactionType.INCOME ? 'bg-action text-white shadow-lg shadow-action/30' : 'text-slate-400'}`}>Ingreso</button>
             </div>
             <button onClick={handleOCR} className={`p-3 rounded-full text-indigo-500 hover:bg-indigo-50 transition-colors ${scanning ? 'animate-pulse bg-indigo-100' : 'bg-slate-50'}`} title="Escanear Recibo">
                 <Camera size={20} strokeWidth={3} />
             </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              
              <div className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-1 scale-110">
                      <span className={`text-3xl font-heading font-black ${type === TransactionType.EXPENSE ? 'text-danger' : 'text-action'}`}>S/.</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className={`text-6xl font-heading font-black bg-transparent w-full max-w-[200px] text-center outline-none placeholder-slate-200 ${type === TransactionType.EXPENSE ? 'text-danger' : 'text-action'}`}
                        autoFocus
                      />
                  </div>
                  {scanning && <p className="text-xs text-indigo-500 font-bold mt-2 animate-pulse">Analizando recibo con IA...</p>}
                  {isDuplicate && (
                      <div className="mt-2 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-bold animate-shake">
                          <AlertTriangle size={14} />
                          Parece que ya anotaste esto
                      </div>
                  )}
              </div>

              <div className="bg-slate-50 flex-1 rounded-t-[2.5rem] p-6 space-y-6">
                  
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="ml-2 mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cuenta</label>
                          <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-base text-sm py-3 bg-white">
                              {accounts.length === 0 && <option value="">Efectivo</option>}
                              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                          </select>
                      </div>
                      <div className="w-1/3">
                          <label className="ml-2 mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-base text-sm py-3 bg-white" />
                      </div>
                  </div>

                  <div>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Nota (Opcional)" className="input-base bg-white" />
                  </div>

                  {type === TransactionType.EXPENSE && (
                      <div className="animate-fade-in">
                          <label className="ml-2 mb-2 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                          <div className="flex flex-wrap gap-2">
                              {categories.map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold font-heading transition-all border-2 ${category === cat ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' : 'bg-white text-slate-500 border-transparent hover:border-slate-200'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500 ml-2">¿Es {type === TransactionType.EXPENSE ? 'gasto' : 'ingreso'} fijo?</span>
                      <div className="flex bg-slate-100 rounded-xl p-1">
                          <button type="button" onClick={() => setIsFixed(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isFixed ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400'}`}>SI</button>
                          <button type="button" onClick={() => setIsFixed(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!isFixed ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400'}`}>NO</button>
                      </div>
                  </div>
              </div>
          </form>

          <div className="p-6 bg-slate-50 safe-area-pb">
              <button 
                type="submit"
                form="tx-form"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-3xl font-heading font-black text-white text-lg shadow-xl shadow-action/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${type === TransactionType.EXPENSE ? 'bg-slate-900' : 'bg-action'}`}
              >
                  {isSubmitting ? 'Guardando...' : <><Check size={24} strokeWidth={3} /> Confirmar</>}
              </button>
          </div>
       </div>
    </div>
  );
};

export default TransactionForm;
