
import React, { useState } from 'react';
import { Target, Plus, Trophy, Plane, Smartphone, Car, Home, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Goal } from '../types';
import Mascot from './Mascot';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, amount: number) => void;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, onAddGoal, onUpdateGoal }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('trophy');

  const getIcon = (iconName: string, size = 20) => {
    switch(iconName) {
      case 'plane': return <Plane size={size} />;
      case 'phone': return <Smartphone size={size} />;
      case 'car': return <Car size={size} />;
      case 'home': return <Home size={size} />;
      default: return <Trophy size={size} />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 pb-12 animate-fade-in">
      {/* Header Seccional */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-heading font-black text-slate-900">Metas Inteligentes</h2>
            <p className="text-slate-500 text-sm font-medium">Tus sueños, un ahorro a la vez.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-90 transition-transform"
        >
            <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {showAdd && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-brand-100 shadow-xl animate-pop-in space-y-6">
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">¿Qué quieres lograr?</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-mobile !bg-slate-50" placeholder="Ej. Nuevo iPhone 16 Pro" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Objetivo</label>
                    <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="input-mobile !bg-slate-50" placeholder="5000" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icono</label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                        {['trophy', 'plane', 'phone', 'car'].map(ic => (
                            <button type="button" key={ic} onClick={() => setIcon(ic)} className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${icon === ic ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-300'}`}>
                                {getIcon(ic, 18)}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
              <div className="flex gap-3">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                  <button onClick={(e: any) => { 
                      onAddGoal({ name, targetAmount: parseFloat(target), currentAmount: 0, color: 'bg-indigo-600', icon });
                      setShowAdd(false); setName(''); setTarget('');
                  }} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20">Guardar Meta</button>
              </div>
          </div>
      )}

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
                <div key={goal.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-soft hover:shadow-xl transition-all group relative overflow-hidden active:scale-[0.99]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-brand-50 text-brand-600 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
                            {getIcon(goal.icon, 24)}
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Objetivo</p>
                             <p className="font-heading font-black text-slate-900 text-lg">S/. {goal.targetAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <h3 className="font-heading font-black text-xl text-slate-800 mb-1">{goal.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-6">Llevas ahorrado <span className="text-brand-600 font-black">S/. {goal.currentAmount.toLocaleString()}</span></p>
                    
                    {/* Barra de Progreso */}
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="text-brand-600">{percent.toFixed(0)}% Completado</span>
                            <span>{goal.targetAmount - goal.currentAmount <= 0 ? '¡Meta Lograda!' : `Faltan S/. ${(goal.targetAmount - goal.currentAmount).toLocaleString()}`}</span>
                        </div>
                    </div>

                    {/* Quick Save Buttons */}
                    <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
                        {[10, 50, 100].map(amt => (
                            <button 
                                key={amt}
                                onClick={() => onUpdateGoal(goal.id, goal.currentAmount + amt)}
                                className="flex-1 py-3.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-transparent hover:border-emerald-100"
                            >
                                <Heart size={12} className="group-hover:fill-current" /> +{amt}
                            </button>
                        ))}
                    </div>

                    {percent >= 100 && (
                        <div className="absolute top-2 right-2 p-1 bg-emerald-500 text-white rounded-full shadow-lg">
                            <Sparkles size={14} />
                        </div>
                    )}
                </div>
            );
        })}
        
        {goals.length === 0 && !showAdd && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                 <Mascot variant="thinking" size={120} className="mb-6 opacity-40 grayscale" />
                 <h3 className="text-lg font-heading font-black text-slate-600">¿Qué sueñas comprar?</h3>
                 <p className="text-xs text-slate-400 mt-2 mb-8 px-12 leading-relaxed">Las metas te ayudan a separar dinero sin darte cuenta.</p>
                 <button onClick={() => setShowAdd(true)} className="flex items-center gap-3 px-8 py-4 bg-brand-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-500/30 active:scale-95 transition-all">
                     <Plus size={18} strokeWidth={3} /> Crear Primera Meta
                 </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default GoalsSection;
