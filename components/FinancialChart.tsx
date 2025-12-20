
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
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
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
    if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
    if (curr.type === TransactionType.INCOME) acc[date].income += curr.amount;
    else acc[date].expense += curr.amount;
    return acc;
  }, {} as Record<string, { date: string, income: number, expense: number }>);

  const areaData = (Object.values(timelineDataMap) as { date: string, income: number, expense: number }[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  const totalIncome = transactions.reduce((sum, t) => t.type === TransactionType.INCOME ? sum + t.amount : sum, 0);
  const totalExpense = transactions.reduce((sum, t) => t.type === TransactionType.EXPENSE ? sum + t.amount : sum, 0);

  if (transactions.length === 0) return (
      <Card className="p-12 flex flex-col items-center justify-center text-slate-400 h-64 border-dashed border-2">
          <span className="text-4xl mb-4">📈</span>
          <p className="font-bold text-slate-500">Sin datos de actividad</p>
          <p className="text-xs">Registra movimientos para ver gráficos</p>
      </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 h-[380px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-heading font-black text-slate-900">Flujo de Caja</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="text-emerald-600 flex items-center gap-1"><ArrowDown size={12}/> {totalIncome.toLocaleString()}</span>
                <span className="text-rose-500 flex items-center gap-1"><ArrowUp size={12}/> {totalExpense.toLocaleString()}</span>
            </div>
        </div>
        <div className="flex-1 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Ingresos" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" name="Gastos" stroke="#f43f5e" fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {pieData.length > 0 && (
        <Card className="p-6 h-[380px] flex flex-col">
          <h3 className="text-lg font-heading font-black text-slate-900 mb-2">Gastos por Categoría</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Distribución mensual</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-xl font-heading font-black text-slate-900">S/. {totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-[10px] font-bold text-slate-600 truncate">{entry.name}</span>
                  </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialChart;
