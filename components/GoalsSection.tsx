import React, { useState } from 'react';
import { Target, Plus, Trophy, Plane, Smartphone, Car, Home } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      color: 'bg-indigo-600',
      icon
    });
    setShowAdd(false);
    setName('');
    setTarget('');
  };

  const getIcon = (name: string) => {
      switch(name) {
          case 'plane': return <Plane size={20} />;
          case 'phone': return <Smartphone size={20} />;
          case 'car': return <Car size={20} />;
          case 'home': return <Home size={20} />;
          default: return <Trophy size={20} />;
      }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-black text-slate-800">Metas Inteligentes</h2>
            <p className="text-slate-500 text-sm">Visualiza y alcanza tus sueños</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800">
            <Plus size={18} /> Nueva Meta
        </button>
      </div>

      {showAdd && (
          <div className="mb-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre del Objetivo</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Ej. Viaje a Cusco" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Monto (S/.)</label>
                        <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="5000" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Icono</label>
                        <div className="flex gap-2">
                            {['trophy', 'plane', 'phone', 'car'].map(ic => (
                                <button type="button" key={ic} onClick={() => setIcon(ic)} className={`p-3 rounded-xl transition-all ${icon === ic ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {getIcon(ic)}
                                </button>
                            ))}
                        </div>
                      </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Guardar Meta</button>
              </form>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
                <div key={goal.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                            {getIcon(goal.icon)}
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-slate-400 font-bold uppercase">Meta</p>
                             <p className="font-bold text-slate-800">S/. {goal.targetAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{goal.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">Tienes S/. {goal.currentAmount.toLocaleString()}</p>
                    
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                        <span>{percent.toFixed(0)}%</span>
                        <span>Falta: S/. {(goal.targetAmount - goal.currentAmount).toLocaleString()}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                        <button 
                            onClick={() => onUpdateGoal(goal.id, goal.currentAmount + 100)}
                            className="flex-1 py-2 text-xs font-bold bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors"
                        >
                            + S/. 100
                        </button>
                         <button 
                            onClick={() => onUpdateGoal(goal.id, goal.currentAmount + 500)}
                            className="flex-1 py-2 text-xs font-bold bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors"
                        >
                            + S/. 500
                        </button>
                    </div>
                </div>
            );
        })}
        
        {goals.length === 0 && !showAdd && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                 <Mascot variant="thinking" size={100} className="mb-4 opacity-70" />
                 <p className="font-medium">Sin metas definidas</p>
                 <button onClick={() => setShowAdd(true)} className="mt-2 text-indigo-600 font-bold text-sm hover:underline">Crear mi primera meta</button>
             </div>
        )}
      </div>
    </div>
  );
};

export default GoalsSection;