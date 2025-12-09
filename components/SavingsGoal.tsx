import React, { useState } from 'react';
import { Target, Save, Edit2, TrendingUp } from 'lucide-react';

interface SavingsGoalProps {
  currentSavings: number;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ currentSavings }) => {
  const [goal, setGoal] = useState<number>(5000); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  const progress = Math.min((currentSavings / goal) * 100, 100);
  const remaining = Math.max(goal - currentSavings, 0);

  const handleSave = () => {
    const val = parseFloat(tempGoal);
    if (!isNaN(val) && val > 0) {
      setGoal(val);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-indigo-500/20 text-white min-h-[180px] flex flex-col justify-between p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
      {/* Background Gradient & Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 z-0"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target size={16} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-indigo-100 tracking-wide uppercase">Meta de Ahorro</span>
            </div>
            
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
                <Edit2 size={16} />
            </button>
        </div>

        {isEditing ? (
            <div className="mt-4 animate-fade-in bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
                <label className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block mb-2">Nueva Meta (S/.)</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={tempGoal}
                        onChange={(e) => setTempGoal(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/30"
                        placeholder="Ej. 5000"
                    />
                    <button 
                        onClick={handleSave}
                        className="bg-white text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 font-bold"
                    >
                        <Save size={18} />
                    </button>
                </div>
            </div>
        ) : (
            <div className="mt-6">
                 <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">S/. {currentSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    <span className="text-indigo-200 text-sm font-medium">/ {goal.toLocaleString()}</span>
                 </div>
                 <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                    {remaining <= 0 ? (
                        <span className="text-emerald-300 font-bold flex items-center gap-1"><TrendingUp size={12}/> ¡Objetivo Logrado!</span>
                    ) : (
                        <span>Faltan <b>S/. {remaining.toLocaleString()}</b></span>
                    )}
                 </p>
            </div>
        )}
      </div>

      {/* Progress Bar Component */}
      <div className="relative z-10 mt-4">
        <div className="flex justify-between text-[10px] font-bold text-indigo-200 mb-1.5 uppercase tracking-wider">
            <span>Progreso</span>
            <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-emerald-400' : 'bg-white'}`}
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoal;