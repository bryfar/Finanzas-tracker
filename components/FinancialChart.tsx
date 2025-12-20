
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid
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
            <span className={`font-black font-heading ${entry.name === 'Ingresos' ? 'text-emerald-600' : 'text-rose-500'}`}>
                S/. {Number(entry.value).toLocaleString(undefined, {minimumFractionDigits: 2})}
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

  const areaData = Object.values(timelineDataMap)
    .sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

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
      <Card className="p-5 md:p-6 flex-1 min-h-[300px] flex flex-col relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 relative z-10">
            <div>
              <h3 className="text-lg font-heading font-black text-slate-900">Flujo de Caja</h3>
              <p className="text-xs font-medium text-slate-400">Últimos 30 días</p>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <ArrowDown size={12} className="text-emerald-600" />
                    <span className="font-heading font-black text-emerald-700 text-xs">S/. {totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                    <ArrowUp size={12} className="text-rose-500" />
                    <span className="font-heading font-black text-rose-700 text-xs">S/. {totalExpense.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" name="Gastos" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {pieData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-heading font-black text-slate-900 mb-4">Top Gastos</h3>
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
                     formatter={(value: number | undefined) => value !== undefined ? `S/. ${value.toFixed(2)}` : ''} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2">
              {pieData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600 font-bold">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">S/. {entry.value.toFixed(0)}</span>
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
