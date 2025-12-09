import React, { useState } from 'react';
import { Target, Edit2, CheckCircle2, X } from 'lucide-react';
import Mascot from './Mascot';

interface SavingsGoalProps {
  currentSavings: number;
  onAdjustBalance: (newBalance: number) => void;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ currentSavings, onAdjustBalance }) => {
  const [goal, setGoal] = useState<number>(5000); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState('');
  const [editMode, setEditMode] = useState<'GOAL' | 'BALANCE'>('GOAL');

  const progress = Math.min((currentSavings / goal) * 100, 100);

  const handleSave = () => {
    const val = parseFloat(tempVal);
    if (!isNaN(val) && val >= 0) {
        if (editMode === 'GOAL') setGoal(val);
        else onAdjustBalance(val);
        setIsEditing(false);
    }
  };

  const openEdit = (mode: 'GOAL' | 'BALANCE') => {
      setEditMode(mode);
      setTempVal(mode === 'GOAL' ? goal.toString() : currentSavings.toString());
      setIsEditing(true);
  };

  return (
    <div className="card-base p-6 relative overflow-visible group">
      {/* Finny Pop-up on success */}
      {progress >= 80 && (
          <div className="absolute -top-10 -right-2 animate-float pointer-events-none z-10">
              <Mascot variant="celebrating" size={80} />
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                  <Target size={20} strokeWidth={2.5} />
              </div>
              <h3 className="font-heading font-bold text-slate-800">Meta Ahorro</h3>
          </div>
          {!isEditing && (
              <button onClick={() => openEdit('GOAL')} className="p-2 text-slate-300 hover:text-brand-500 transition-colors">
                  <Edit2 size={16} />
              </button>
          )}
      </div>

      {isEditing ? (
          <div className="animate-fade-in bg-slate-50 p-4 rounded-3xl border border-slate-100">
               <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">
                   {editMode === 'GOAL' ? 'Nuevo Objetivo' : 'Saldo Real'}
               </label>
               <div className="flex gap-2">
                   <input 
                      type="number" 
                      value={tempVal} 
                      onChange={e => setTempVal(e.target.value)}
                      className="w-full bg-white rounded-2xl px-4 font-heading font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      autoFocus
                   />
                   <button onClick={handleSave} className="w-10 h-10 bg-action text-white rounded-xl flex items-center justify-center shadow-lg shadow-action/20">
                       <CheckCircle2 size={20} />
                   </button>
                   <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
                       <X size={20} />
                   </button>
               </div>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Progreso</span>
                  <div className="flex items-baseline gap-2 cursor-pointer group/balance" onClick={() => openEdit('BALANCE')}>
                      <span className="font-heading font-black text-3xl text-slate-800">S/. {currentSavings.toLocaleString()}</span>
                      <Edit2 size={12} className="text-slate-300 opacity-0 group-hover/balance:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">de S/. {goal.toLocaleString()}</span>
              </div>

              {/* Bar */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                      className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-action' : 'bg-brand-500'}`}
                      style={{ width: `${progress}%` }}
                  ></div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold">
                  <span className={`${progress >= 100 ? 'text-action' : 'text-brand-500'}`}>{progress.toFixed(0)}% Completado</span>
                  <span className="text-slate-400">{goal - currentSavings <= 0 ? '¡Listo!' : `Falta S/. ${(goal - currentSavings).toLocaleString()}`}</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default SavingsGoal;