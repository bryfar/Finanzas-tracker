import React from 'react';
import { Flame, Plus, Zap } from 'lucide-react';
import Mascot from './Mascot';

interface StoriesBarProps {
  streak: number;
  onOpenSnaps: () => void;
  onAddQuick: () => void;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ streak, onOpenSnaps, onAddQuick }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 select-none">
      
      {/* 1. Main Streak Circle (The Fire) */}
      <div 
        onClick={onOpenSnaps}
        className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
      >
        <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-orange-400 via-rose-500 to-indigo-600 animate-[spin_4s_linear_infinite] group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white rounded-full border-[3px] border-white flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-orange-50 group-hover:bg-orange-100 transition-colors"></div>
             <Flame className="text-orange-500 relative z-10 animate-pulse" size={24} fill="currentColor" />
             {/* Streak Count Badge */}
             <div className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {streak}
             </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-600">Tu Racha</span>
      </div>

      {/* 2. Quick Tip */}
      <div className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0 opacity-80 hover:opacity-100" onClick={onOpenSnaps}>
        <div className="w-16 h-16 rounded-full p-[2px] bg-slate-200 group-hover:bg-brand-300 transition-colors">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <Mascot variant="thinking" size={40} className="mt-2" />
            </div>
        </div>
        <span className="text-[10px] font-medium text-slate-500">Tips IA</span>
      </div>

       {/* 3. Add Quick Story (Mock) */}
      <div className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0" onClick={onAddQuick}>
        <div className="w-16 h-16 rounded-full p-[2px] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <Plus className="text-slate-400" size={24} />
        </div>
        <span className="text-[10px] font-medium text-slate-400">Nuevo</span>
      </div>

    </div>
  );
};

export default StoriesBar;