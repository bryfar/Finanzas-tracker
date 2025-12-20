
import React, { useState, useEffect } from 'react';
import { X, Heart, ChevronDown, ChevronUp, Zap, Sparkles, Flame } from 'lucide-react';
import { Snap, UserMetadata } from '../types';
import Mascot from './Mascot';
import { transactionService } from '../services/transactionService';

interface FinnySnapsProps {
  snaps: Snap[];
  onClose: () => void;
  userId: string;
  userMetadata?: UserMetadata;
  onRefreshData: () => void;
}

const FinnySnaps: React.FC<FinnySnapsProps> = ({ snaps, onClose, userId, userMetadata, onRefreshData }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleNext = () => {
      if (activeIndex < snaps.length - 1) setActiveIndex(p => p + 1);
      else onClose();
  };

  const handlePrev = () => {
      if (activeIndex > 0) setActiveIndex(p => p - 1);
  };

  const handleDoubleTap = async (snap: Snap) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTap < DOUBLE_TAP_DELAY && snap.type === 'GOAL_PROMO' && snap.content.goalId && !processing) {
          setShowHeart(true);
          setProcessing(true);
          setTimeout(() => setShowHeart(false), 800);

          try {
              const amount = userMetadata?.quick_save_amount || 5;
              await transactionService.quickSave(userId, snap.content.goalId, amount);
              onRefreshData();
          } catch (e) {
              console.error(e);
          } finally {
              setProcessing(false);
          }
      }
      setLastTap(now);
  };

  const currentSnap = snaps[activeIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in overflow-hidden">
        <div className="w-full max-w-lg h-[100dvh] relative bg-slate-900 flex flex-col">
            
            {/* Background Image */}
            <div className="absolute inset-0 transition-all duration-700">
                <img 
                    src={currentSnap?.content.mediaUrl || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop"} 
                    className="w-full h-full object-cover scale-105" 
                    alt="bg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>
            </div>

            {/* Header Indicators */}
            <div className="relative z-30 pt-4 px-4 flex gap-1.5">
                {snaps.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-white transition-all duration-300 ${idx === activeIndex ? 'w-full' : idx < activeIndex ? 'w-full' : 'w-0'}`}></div>
                    </div>
                ))}
            </div>

            <button onClick={onClose} className="absolute top-10 right-6 z-40 text-white/80 p-2 bg-black/20 rounded-full backdrop-blur-md active:scale-90 transition-transform">
                <X size={24} strokeWidth={3} />
            </button>

            {/* Nav Zones */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-20" onClick={handlePrev}></div>
            <div className="absolute inset-y-0 right-0 w-1/4 z-20" onClick={handleNext}></div>

            {/* Content Area */}
            <div 
                className="relative z-30 flex-1 flex flex-col justify-end p-8 pb-16"
                onClick={() => handleDoubleTap(currentSnap)}
            >
                 <div className="space-y-4 animate-slide-up">
                     {currentSnap?.type === 'STREAK_SUMMARY' && (
                         <div className="bg-orange-500 p-1.5 rounded-xl w-fit text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 flex items-center gap-2">
                             <Flame size={12} fill="white" /> Día {activeIndex + 1}
                         </div>
                     )}
                     
                     <h2 className="text-4xl font-heading font-black text-white leading-[1.1] drop-shadow-2xl">
                         {currentSnap?.content.title}
                     </h2>
                     <p className="text-xl text-slate-100 font-medium leading-relaxed drop-shadow-lg opacity-90">
                         {currentSnap?.content.subtitle}
                     </p>

                     {currentSnap?.type === 'GOAL_PROMO' && (
                         <div className="pt-6">
                             <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 flex flex-col items-center gap-3 animate-pulse">
                                 <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                     <Heart size={28} fill="white" className="text-white" />
                                 </div>
                                 <p className="text-xs font-black uppercase tracking-widest text-white text-center">Doble tap para ahorrar S/. {userMetadata?.quick_save_amount || 5}</p>
                             </div>
                         </div>
                     )}
                 </div>
            </div>

            {showHeart && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <Heart size={180} className="text-rose-500 animate-pop-in drop-shadow-[0_0_50px_rgba(244,63,94,0.5)]" fill="currentColor" />
                    <div className="absolute mt-4 animate-float">
                        <Mascot variant="celebrating" size={140} />
                    </div>
                </div>
            )}
            
            {processing && (
                 <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-3 rounded-full font-black text-sm shadow-2xl animate-pop-in flex items-center gap-3 border-2 border-white/20">
                     <Sparkles size={20} /> ¡Ahorro registrado!
                 </div>
            )}
        </div>
    </div>
  );
};

export default FinnySnaps;
