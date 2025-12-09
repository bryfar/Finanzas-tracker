import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { chatWithFinancialAdvisor } from '../services/geminiService';
import { Transaction, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import Mascot from './Mascot';

interface AIAdvisorProps {
  transactions: Transaction[];
  streak: number;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, streak }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputMsg, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInputMsg('');
    setLoading(true);

    const hist = messages.map(m => ({ role: m.role, text: m.text }));
    const resp = await chatWithFinancialAdvisor(hist, userMsg.text, transactions, streak);
    
    setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'model', text: resp, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="card-base h-full flex flex-col overflow-hidden relative border-0 shadow-soft">
       {/* Header */}
       <div className="p-5 bg-gradient-to-r from-brand-500 to-brand-600 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
              <Mascot variant="thinking" size={100} />
           </div>
           
           <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden">
                   <Mascot variant="thinking" size={40} className="mt-1" />
               </div>
               <div>
                   <h3 className="font-heading font-bold text-lg leading-tight">Finny Advisor</h3>
                   <p className="text-brand-100 text-xs font-medium flex items-center gap-1">
                       <span className="w-2 h-2 bg-action rounded-full animate-pulse"></span> En línea
                   </p>
               </div>
           </div>
           <Sparkles size={18} className="text-brand-200 animate-pulse relative z-10" />
       </div>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50 relative">
           {messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                   <Mascot variant="idle" size={120} className="mb-4" />
                   <p className="font-heading font-bold text-slate-600">¿Cómo puedo ayudarte hoy?</p>
                   <p className="text-xs text-slate-400 mt-2">Analizo tus gastos y te doy consejos.</p>
               </div>
           )}
           
           {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'model' && (
                       <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                           <Mascot variant="thinking" size={24} className="mt-1" />
                       </div>
                   )}
                   <div className={`max-w-[80%] p-4 text-sm font-medium leading-relaxed shadow-sm ${
                       msg.role === 'user' 
                       ? 'bg-brand-600 text-white rounded-[1.5rem] rounded-tr-md' 
                       : 'bg-white text-slate-700 border border-slate-100 rounded-[1.5rem] rounded-tl-md'
                   }`}>
                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                   </div>
               </div>
           ))}
           {loading && (
               <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                        <Mascot variant="thinking" size={24} className="mt-1" />
                    </div>
                   <div className="bg-white px-4 py-3 rounded-[1.5rem] rounded-tl-md border border-slate-100 flex items-center gap-2">
                       <Loader2 size={16} className="animate-spin text-brand-500" />
                       <span className="text-xs font-bold text-slate-400">Finny está pensando...</span>
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
       </div>

       {/* Input */}
       <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-50">
           <div className="relative">
               <input 
                  type="text" 
                  value={inputMsg} 
                  onChange={e => setInputMsg(e.target.value)} 
                  placeholder="Pregúntale a Finny..."
                  className="w-full bg-slate-50 border-none rounded-3xl pl-5 pr-14 py-4 font-heading font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/10 placeholder-slate-400"
               />
               <button type="submit" disabled={loading || !inputMsg.trim()} className="absolute right-2 top-2 bottom-2 w-10 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 disabled:opacity-50 active:scale-95 transition-all">
                   <Send size={18} strokeWidth={2.5} />
               </button>
           </div>
       </form>
    </div>
  );
};

export default AIAdvisor;