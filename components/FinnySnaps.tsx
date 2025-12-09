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

  // Swipe Handlers (Simple implementation)
  const handleScroll = (e: React.WheelEvent) => {
      if (e.deltaY > 50 && activeIndex < snaps.length - 1) setActiveIndex(prev => prev + 1);
      if (e.deltaY < -50 && activeIndex > 0) setActiveIndex(prev => prev - 1);
  };

  const handleDoubleTap = async (snap: Snap) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTap < DOUBLE_TAP_DELAY && snap.type === 'GOAL_PROMO' && snap.content.goalId && !processing) {
          // Double Tap Triggered
          setShowHeart(true);
          setProcessing(true);
          setTimeout(() => setShowHeart(false), 1000);

          try {
              const amount = userMetadata?.quick_save_amount || 5;
              await transactionService.quickSave(userId, snap.content.goalId, amount);
              
              // Success Feedback
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Coin sound
              audio.volume = 0.5;
              audio.play().catch(() => {});
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
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in" onWheel={handleScroll}>
        <div className="w-full max-w-md h-[100dvh] md:h-[90vh] md:rounded-[2.5rem] relative bg-slate-900 overflow-hidden shadow-2xl">
            
            {/* Background Image */}
            <div className="absolute inset-0 opacity-60">
                <img 
                    src={currentSnap?.content.mediaUrl || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop"} 
                    className="w-full h-full object-cover" 
                    alt="bg"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40"></div>

            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white/80 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md">
                <X size={24} />
            </button>

            {/* Content Content */}
            <div 
                className="absolute inset-0 z-10 flex flex-col justify-end p-8 pb-16 md:pb-8"
                onClick={() => handleDoubleTap(currentSnap)}
            >
                 <div className="space-y-4 animate-slide-up">
                     {currentSnap?.type === 'STREAK_SUMMARY' && (
                         <div className="bg-orange-500/20 backdrop-blur-md border border-orange-500/50 text-orange-100 px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                             <Flame size={12} fill="currentColor" /> Modo Racha
                         </div>
                     )}
                     {currentSnap?.type === 'GOAL_PROMO' && (
                         <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 text-emerald-100 px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                             <Zap size={12} fill="currentColor" /> Oportunidad de Ahorro
                         </div>
                     )}
                     
                     <h2 className="text-4xl font-heading font-black text-white leading-tight drop-shadow-lg">
                         {currentSnap?.content.title}
                     </h2>
                     <p className="text-lg text-slate-200 font-medium leading-relaxed drop-shadow-md">
                         {currentSnap?.content.subtitle}
                     </p>

                     {currentSnap?.type === 'GOAL_PROMO' && (
                         <div className="pt-4">
                             <div className="flex items-center gap-4 text-white/80 text-sm animate-pulse">
                                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                                     <Heart size={24} fill="white" />
                                 </div>
                                 <p className="font-bold">Doble Tap para ahorrar S/. {userMetadata?.quick_save_amount || 5}</p>
                             </div>
                         </div>
                     )}
                 </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                {snaps.map((_, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setActiveIndex(idx)}
                        className={`w-1.5 rounded-full transition-all cursor-pointer ${activeIndex === idx ? 'h-6 bg-white' : 'h-1.5 bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Swipe Indicators */}
            {activeIndex < snaps.length - 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
                    <ChevronUp size={32} />
                </div>
            )}

            {/* Success Animation Overlay (Hearts/Coins) */}
            {showHeart && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <Heart size={150} className="text-rose-500 animate-pop-in drop-shadow-2xl" fill="currentColor" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Mascot variant="celebrating" size={200} className="animate-float" />
                    </div>
                </div>
            )}
            
            {processing && (
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-xl animate-slide-up flex items-center gap-2">
                     <Sparkles size={16} /> ¡Ahorro Guardado!
                 </div>
            )}
        </div>
    </div>
  );
};

export default FinnySnaps;