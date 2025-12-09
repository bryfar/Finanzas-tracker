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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
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
    }, 4000); // Auto close after 4s
    return () => clearTimeout(timer);
  }, [notif, onRemove]);

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-white border-emerald-100 text-slate-800 shadow-emerald-500/10';
      case 'error': return 'bg-white border-rose-100 text-slate-800 shadow-rose-500/10';
      default: return 'bg-white border-indigo-100 text-slate-800 shadow-indigo-500/10';
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-500"><CheckCircle2 size={16} strokeWidth={3} /></div>;
      case 'error': return <div className="p-1.5 bg-rose-100 rounded-full text-rose-500"><AlertCircle size={16} strokeWidth={3} /></div>;
      default: return <div className="p-1.5 bg-indigo-100 rounded-full text-indigo-500"><Info size={16} strokeWidth={3} /></div>;
    }
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-3 rounded-2xl shadow-xl border animate-pop-in ${getStyles(notif.type)} relative overflow-hidden group`}>
      {/* Progress Bar Animation (Optional fancy touch) */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-slate-100`}>
         <div className={`h-full w-full origin-left animate-[shrink_4s_linear_forwards] ${notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'error' ? 'bg-rose-400' : 'bg-indigo-400'}`}></div>
      </div>
      
      {getIcon(notif.type)}
      <p className="text-sm font-bold flex-1">{notif.message}</p>
      <button onClick={onRemove} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
        <X size={14} />
      </button>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;