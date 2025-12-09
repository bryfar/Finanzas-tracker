import React, { useState } from 'react';
import { CreditCard, Calendar, Plus, ExternalLink, Zap } from 'lucide-react';
import { Subscription, Category } from '../types';

interface SubscriptionTrackerProps {
  subscriptions: Subscription[];
  onAdd: (sub: Omit<Subscription, 'id'>) => void;
}

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ subscriptions, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const monthlyTotal = subscriptions.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportCalendar = () => {
    // Generate simple ICS content
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FinanzasAI//NONSGML v1.0//EN\n";
    subscriptions.forEach(sub => {
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:Pago ${sub.name}\n`;
        icsContent += `DTSTART;VALUE=DATE:${sub.nextPaymentDate.replace(/-/g, '')}\n`;
        icsContent += `DESCRIPTION:Pago mensual de S/. ${sub.amount}\n`;
        icsContent += "RRULE:FREQ=MONTHLY\n";
        icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'mis_pagos.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAdd({
          name, 
          amount: parseFloat(amount),
          billingCycle: 'MONTHLY',
          nextPaymentDate: date,
          category: Category.SERVICES
      });
      setShowAdd(false);
      setName(''); setAmount(''); setDate('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 bg-indigo-600 text-white">
          <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-yellow-300 fill-current"/> Suscripciones</h3>
                <p className="text-indigo-200 text-xs">Gastos recurrentes</p>
              </div>
              <button onClick={handleExportCalendar} className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors" title="Exportar a Calendario">
                  <Calendar size={18} />
              </button>
          </div>
          <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">S/. {monthlyTotal.toFixed(2)}</span>
              <span className="text-indigo-200 text-sm font-medium">/ mes</span>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                          {sub.name.substring(0, 2)}
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-800 text-sm">{sub.name}</h4>
                          <p className="text-[10px] text-slate-500">Próx: {new Date(sub.nextPaymentDate).toLocaleDateString()}</p>
                      </div>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">S/. {sub.amount}</span>
              </div>
          ))}

          {showAdd ? (
              <form onSubmit={handleSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fade-in">
                  <input type="text" placeholder="Netflix, Spotify..." className="w-full p-2 text-xs rounded border" value={name} onChange={e => setName(e.target.value)} required />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Monto" className="w-full p-2 text-xs rounded border" value={amount} onChange={e => setAmount(e.target.value)} required />
                    <input type="date" className="w-full p-2 text-xs rounded border" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded text-xs font-bold">Guardar</button>
              </form>
          ) : (
             <button onClick={() => setShowAdd(true)} className="w-full py-3 border border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                 <Plus size={14} /> Agregar Suscripción
             </button>
          )}
      </div>
    </div>
  );
};

export default SubscriptionTracker;