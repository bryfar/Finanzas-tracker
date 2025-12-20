
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from './ui/Card';

interface FinancialChartProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#84cc16', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 shadow-xl shadow-slate-900/10 rounded-2xl border border-slate-100 text-slate-800 animate-pop-in">
        <p className="font-bold text-xs text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-50 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 text-sm mb-2 last:mb-0">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="font-semibold text-slate-600">{entry.name}</span>
            </div>
            <span className={`font-black font-heading ${entry.name === 'Ingresos' ? 'text-action' : 'text-rose-500'}`}>
                S/. {entry.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  
  const expenseByCategory = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  })).sort((a, b) => b.value - a.value);

  const timelineDataMap = transactions.reduce((acc, curr) => {
    const date = curr.date; 
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0 };
    }
    if (curr.type === TransactionType.INCOME) acc[date].income += curr.amount;
    else acc[date].expense += curr.amount;
    return acc;
  }, {} as Record<string, { date: string, income: number, expense: number }>);

  // Fix: Cast the results of Object.values to the expected type to prevent unknown access errors in sort
  const areaData = (Object.values(timelineDataMap) as { date: string, income: number, expense: number }[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  // Summary for header
  const totalIncome = transactions.reduce((sum, t) => t.type === TransactionType.INCOME ? sum + t.amount : sum, 0);
  const totalExpense = transactions.reduce((sum, t) => t.type === TransactionType.EXPENSE ? sum + t.amount : sum, 0);

  if (transactions.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-slate-400 h-64 bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <span className="text-2xl opacity-50">📊</span>
        </div>
        <p className="font-heading font-bold text-slate-500">Sin datos financieros</p>
        <p className="text-xs mt-1 text-slate-400">Tus gráficas aparecerán aquí.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Trend Chart */}
      <Card className="p-5 md:p-6 flex-1 min-h-[300px] flex flex-col relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 relative z-10">
            <div>
              <h3 className="text-lg font-heading font-black text-slate-900 flex items-center gap-2">
                  Flujo de Caja
              </h3>
              <p className="text-xs font-medium text-slate-400">Últimos 30 días</p>
            </div>
            
            <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <ArrowDown size={12} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-emerald-400 uppercase">Ingresos</p>
                        <p className="font-heading font-black text-emerald-700 text-xs">S/. {totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                        <ArrowUp size={12} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-rose-400 uppercase">Gastos</p>
                        <p className="font-heading font-black text-rose-700 text-xs">S/. {totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex-1 w-full min-h-0 relative z-10 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {day:'numeric', month:'short'})}
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}}
                tickFormatter={(value) => `S/.${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Ingresos" 
                stroke="#84cc16" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Gastos" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Categories Pie */}
      {pieData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-heading font-black text-slate-900 mb-4 flex items-center gap-2">
             <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
                 <span className="text-base">🍕</span>
             </div>
             Top Gastos
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-40 w-40 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: number) => `S/. ${value.toFixed(2)}`} 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', color: '#1e293b', padding: '8px 12px' }}
                     itemStyle={{ color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                 <span className="text-lg font-heading font-black text-slate-800">
                    S/.{pieData.reduce((a,b) => a + b.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                 </span>
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center text-xs p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-default group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600 font-bold truncate max-w-[100px] group-hover:text-slate-900">{entry.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-800">S/. {entry.value.toFixed(0)}</span>
                      <span className="text-[8px] text-slate-400 font-bold">
                          {((entry.value / pieData.reduce((a,b) => a+b.value, 0)) * 100).toFixed(1)}%
                      </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialChart;
