import React from 'react';
import { BookOpen, Clock, Lightbulb } from 'lucide-react';
import { generateEducationTips } from '../services/geminiService';
import { Transaction } from '../types';

interface EducationViewProps {
  transactions: Transaction[];
}

const EducationView: React.FC<EducationViewProps> = ({ transactions }) => {
  const tips = generateEducationTips(transactions);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-100 text-brand-600 rounded-2xl">
              <BookOpen size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-heading font-black text-slate-900">Educación</h2>
              <p className="text-slate-500 text-sm">Aprende a dominar tu dinero</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map(tip => (
              <div key={tip.id} className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-100 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{tip.category}</span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                          <Clock size={12} /> {tip.readTime}
                      </div>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">{tip.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{tip.content}</p>
                  <div className="mt-4 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-all">
                          <Lightbulb size={16} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Glosario Mini */}
      <div className="mt-8 bg-slate-50 rounded-[2.5rem] p-8">
          <h3 className="font-heading font-bold text-slate-800 mb-4">Glosario Rápido</h3>
          <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <span className="font-black text-brand-600">APR:</span> <span className="text-slate-600 text-sm">Tasa de porcentaje anual. Lo que te cobra el banco por prestarte dinero.</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <span className="font-black text-brand-600">Activo:</span> <span className="text-slate-600 text-sm">Todo lo que pone dinero en tu bolsillo (inversiones, negocios).</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EducationView;
