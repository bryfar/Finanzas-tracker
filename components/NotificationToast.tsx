
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-[90%] max-w-sm pointer-events-none">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notif={notif} onRemove={() => removeNotification(notif.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notif: Notification; onRemove: () => void }> = ({ notif, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notif, onRemove]);

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'border-action-light bg-white/90 text-slate-800 shadow-action/10';
      case 'error': return 'border-rose-100 bg-white/90 text-slate-800 shadow-rose-500/10';
      default: return 'border-brand-100 bg-white/90 text-slate-800 shadow-brand-500/10';
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-action-light rounded-2xl text-action"><CheckCircle2 size={18} strokeWidth={3} /></div>;
      case 'error': return <div className="p-2 bg-rose-50 rounded-2xl text-rose-500"><AlertCircle size={18} strokeWidth={3} /></div>;
      default: return <div className="p-2 bg-brand-50 rounded-2xl text-brand-500"><Info size={18} strokeWidth={3} /></div>;
    }
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-4 p-4 rounded-[1.8rem] shadow-2xl border backdrop-blur-xl animate-pop-in ${getStyles(notif.type)} relative overflow-hidden group`}>
      {/* Timer Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100/50">
         <div className={`h-full origin-left animate-timer-shrink ${
           notif.type === 'success' ? 'bg-action' : notif.type === 'error' ? 'bg-rose-500' : 'bg-brand-500'
         }`}></div>
      </div>
      
      {getIcon(notif.type)}
      
      <div className="flex-1">
        <p className="text-sm font-black text-slate-800 leading-tight">{notif.message}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Notificación de Finny</p>
      </div>

      <button onClick={onRemove} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-300 transition-colors">
        <X size={16} />
      </button>

      <style>{`
        @keyframes timer-shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-timer-shrink {
          animation: timer-shrink 4.5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
