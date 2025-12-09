import React, { useState } from 'react';
import { Plus, Minus, Calendar, Tag, FileText, Check } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFixed, setIsFixed] = useState<boolean>(true); // true = Fijo, false = Variable
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);

    // Lógica para descripción y categoría automática en Ingresos
    let finalDescription = description;
    let finalCategory = category;

    if (type === TransactionType.INCOME) {
      finalDescription = isFixed ? 'Ingreso Recurrente / Sueldo' : 'Ingreso Extra / Variable';
      finalCategory = isFixed ? Category.FIXED_INCOME : Category.VARIABLE_INCOME;
    } else {
        if (!description) {
            setIsSubmitting(false);
            return;
        }
    }

    onAddTransaction({
      amount: parseFloat(amount),
      description: finalDescription,
      type,
      category: finalCategory,
      date,
      isFixed,
    });

    // Reset con animación
    setTimeout(() => {
        setAmount('');
        setDescription('');
        setIsSubmitting(false);
    }, 200);
  };

  const expenseCategories = Object.values(Category).filter(
    c => c !== Category.FIXED_INCOME && c !== Category.VARIABLE_INCOME
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Nuevo Movimiento</h3>
        <p className="text-sm text-slate-400">Registra tus gastos o ingresos</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        
        {/* Toggle Type - Segmented Control */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
           {/* Slider Animation Background could go here */}
          <button
            type="button"
            onClick={() => { setType(TransactionType.INCOME); setIsFixed(true); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              type === TransactionType.INCOME
                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus size={16} strokeWidth={3} /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              type === TransactionType.EXPENSE
                ? 'bg-white text-rose-500 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Minus size={16} strokeWidth={3} /> Gasto
          </button>
        </div>

        {/* Amount Input - Hero Element */}
        <div className="relative group">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Monto (Soles)</label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl ${type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>S/.</span>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-2xl font-bold text-slate-800 placeholder-slate-300"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Toggle Fixed / Variable - Cards */}
        <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => setIsFixed(true)}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition-all border ${
                    isFixed 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
            >
                {type === TransactionType.INCOME ? '💰 Fijo / Sueldo' : '🏢 Gasto Fijo'}
            </button>
            <button
                type="button"
                onClick={() => setIsFixed(false)}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition-all border ${
                    !isFixed 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
            >
                {type === TransactionType.INCOME ? '💸 Extra / Variable' : '☕ Gasto Variable'}
            </button>
        </div>

        {/* Additional Fields Wrapper */}
        <div className="space-y-4">
             {/* Date */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
              />
            </div>

            {/* Expense Specifics with Animation */}
            {type === TransactionType.EXPENSE && (
                <div className="space-y-4 animate-slide-up">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Tag size={18} />
                        </div>
                        <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-600 appearance-none cursor-pointer hover:bg-slate-50"
                        >
                        {expenseCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <FileText size={18} />
                        </div>
                        <input
                        type="text"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium text-slate-600 placeholder-slate-300 transition-colors"
                        placeholder="Descripción (ej: Almuerzo)"
                        />
                    </div>
                </div>
            )}
        </div>

        <div className="flex-1"></div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 text-white rounded-2xl transition-all font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${
            type === TransactionType.INCOME 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
          }`}
        >
          {isSubmitting ? <span className="animate-pulse">Guardando...</span> : (
            <>
               <Check size={20} strokeWidth={3} />
               {type === TransactionType.INCOME ? 'Registrar Ingreso' : 'Registrar Gasto'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;