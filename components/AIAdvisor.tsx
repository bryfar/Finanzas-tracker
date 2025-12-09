import React, { useState } from 'react';
import { Sparkles, Loader2, Send, BrainCircuit, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getFinancialHealthAnalysis, chatWithFinancialAdvisor } from '../services/geminiService';
import { Transaction, AIFinancialAnalysis, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [analysis, setAnalysis] = useState<AIFinancialAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    const result = await getFinancialHealthAnalysis(transactions);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMsg,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setLoadingChat(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithFinancialAdvisor(history, userMsg.text, transactions);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoadingChat(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case 'ALTO': return <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">ALTO IMPACTO</span>;
      case 'MEDIO': return <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MEDIO</span>;
      default: return <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">CONSEJO</span>;
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-800 overflow-hidden flex flex-col h-full text-slate-100 relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
              <h3 className="font-bold text-base tracking-tight text-white leading-tight">Asesor IA</h3>
              <p className="text-[10px] text-slate-400 font-medium">Powered by Gemini 2.5</p>
          </div>
        </div>
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'analysis' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Reporte
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900 relative">
        
        {activeTab === 'analysis' && (
          <div className="p-6 space-y-6">
            {!analysis && !loadingAnalysis && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                    <BrainCircuit size={32} className="text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Análisis Financiero</h4>
                <p className="text-sm text-slate-400 max-w-xs mb-6">Genera un diagnóstico completo de tus finanzas, incluyendo score de salud y proyecciones.</p>
                <button 
                  onClick={handleAnalyze}
                  className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-lg shadow-white/5 transition-all transform hover:scale-105"
                >
                  <span className="flex items-center gap-2"><Sparkles size={16}/> Analizar mis datos</span>
                </button>
              </div>
            )}

            {loadingAnalysis && (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Loader2 className="animate-spin text-indigo-400 mb-4" size={40} />
                <p className="text-slate-400 animate-pulse text-sm font-medium">Analizando patrones de gasto...</p>
              </div>
            )}

            {analysis && (
              <div className="animate-fade-in space-y-6 pb-4">
                {/* Score Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-1 border border-slate-700 shadow-xl">
                    <div className="bg-slate-900/80 rounded-xl p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Salud Financiera</span>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${analysis.healthScore > 70 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'}`}>
                                BETA
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                             <div className={`text-6xl font-black ${getScoreColor(analysis.healthScore)} leading-none tracking-tighter`}>
                                {analysis.healthScore}
                             </div>
                             <span className="text-sm text-slate-500 font-medium mb-1.5">/ 100</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-1000 ${analysis.healthScore > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${analysis.healthScore}%`}}
                             ></div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
                   <h5 className="font-bold text-indigo-300 mb-3 flex items-center gap-2 text-sm">
                      <TrendingUp size={16} /> Diagnóstico
                    </h5>
                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-3">
                         <div className="min-w-[4px] bg-indigo-500 rounded-full"></div>
                         <p className="text-xs text-slate-400 italic">"{analysis.forecast}"</p>
                    </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Plan de Acción
                  </h4>
                  <div className="space-y-3">
                    {analysis.tips.map((tip, idx) => (
                      <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-slate-200 text-sm">{tip.title}</h5>
                          {getImpactBadge(tip.impact)}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={handleAnalyze} 
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700"
                >
                  Recalcular
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
                      <MessageSquare size={20} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium">Asistente Virtual</p>
                  <p className="text-xs opacity-60 max-w-[200px] text-center mt-1">Pregúntame sobre tus gastos, presupuesto o consejos de inversión en Perú.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 text-sm"
                />
                <button 
                  type="submit" 
                  disabled={!inputMsg.trim() || loadingChat}
                  className="absolute right-2 top-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors aspect-square flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;