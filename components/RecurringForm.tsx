
import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, Wallet, Check } from 'lucide-react';
import { RecurringTransaction, TransactionType, Category, Account } from '../types';
import { transactionService } from '../services/transactionService';

interface RecurringFormProps {
  userId: string;
  onClose: () => void;
  onAdded: () => void;
}

const RecurringForm: React.FC<RecurringFormProps> = ({ userId, onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [day, setDay] = useState('15');
  const [isAuto, setIsAuto] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [category, setCategory] = useState<Category>(Category.OTHER);

  useEffect(() => {
    transactionService.getAccounts(userId).then(setAccounts);
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !accountId) return;

    await transactionService.addRecurring(userId, {
      name,
      amount: parseFloat(amount),
      type,
      category: type === TransactionType.INCOME ? Category.FIXED_INCOME : category,
      dayOfMonth: parseInt(day),
      isAuto,
      accountId
    });
    
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-pop-in">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500"><X /></button>
        
        <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-black text-slate-900">Programar Finanzas</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Automatiza tu ahorro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>Gasto Fijo</button>
                <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Ingreso Fijo</button>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <input type="text" placeholder="Ej. Universidad, Sueldo..." value={name} onChange={e => setName(e.target.value)} className="input-base" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Monto S/." value={amount} onChange={e => setAmount(e.target.value)} className="input-base" required />
                    <div className="relative">
                        <input type="number" min="1" max="31" placeholder="Día (1-31)" value={day} onChange={e => setDay(e.target.value)} className="input-base" required />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    </div>
                </div>

                <select value={accountId} onChange={e => setAccountId(e.target.value)} className="input-base text-sm" required>
                    <option value="">Selecciona Cuenta...</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                             <Sparkles size={14} className="text-brand-500" /> Registrar automático
                        </p>
                        <p className="text-[10px] text-slate-400">Finny lo hará por ti el día fijado</p>
                    </div>
                    <button type="button" onClick={() => setIsAuto(!isAuto)} className={`w-12 h-6 rounded-full transition-all relative ${isAuto ? 'bg-brand-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isAuto ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Check size={20} /> Guardar Programación
            </button>
        </form>
      </div>
    </div>
  );
};

export default RecurringForm;
