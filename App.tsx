import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, LayoutDashboard, PiggyBank, Receipt, ShoppingBag, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle, CloudOff, LogOut } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialChart from './components/FinancialChart';
import AIAdvisor from './components/AIAdvisor';
import SavingsGoal from './components/SavingsGoal';
import Auth from './components/Auth';
import { Transaction, TransactionType, FinancialSummary } from './types';
import { transactionService } from './services/transactionService';
import { authService } from './services/authService';

function App() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({ 
      totalIncome: 0, 
      totalExpense: 0, 
      balance: 0, 
      savingsRate: 0,
      fixedExpenses: 0,
      variableExpenses: 0
  });

  // Verificar sesión inicial
  useEffect(() => {
    authService.getSession().then((session) => {
      setSession(session);
      // Solo quitamos el loading inicial si no hay sesión, 
      // si hay sesión esperamos a cargar datos
      if (!session) setIsLoading(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
          setTransactions([]); // Limpiar datos al salir
          setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos cuando hay sesión
  useEffect(() => {
    if (session) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          setErrorMsg(null);
          const data = await transactionService.getAll();
          setTransactions(data);
        } catch (error: any) {
          console.error("Error crítico cargando datos:", error);
          setErrorMsg("Hubo un problema iniciando la aplicación. Se activó el modo local.");
          setIsOffline(true);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [session]);

  // Calcular resumen cada vez que cambian las transacciones
  useEffect(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const fixedExpenses = expenses.filter(t => t.isFixed).reduce((sum, t) => sum + t.amount, 0);
    const variableExpenses = expenses.filter(t => !t.isFixed).reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    // Si no hay ingresos, la tasa de ahorro es 0. Si el balance es negativo, es 0.
    const savingsRate = totalIncome > 0 && balance > 0 ? (balance / totalIncome) * 100 : 0;

    setSummary({
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      fixedExpenses,
      variableExpenses
    });
  }, [transactions]);

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const savedTx = await transactionService.add(newTx);
      setTransactions(prev => [savedTx, ...prev]);
    } catch (error: any) {
      // Fallback UI si falla incluso el servicio (raro con el nuevo servicio híbrido)
      alert('Error guardando transacción');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // Optimistic Update
      const prevTransactions = [...transactions];
      setTransactions(prev => prev.filter(t => t.id !== id)); 
      
      await transactionService.delete(id);
    } catch (error: any) {
       console.error("Error eliminando", error);
       // Si falla el borrado, el usuario ya vio que desapareció (optimista), 
       // en una app real revertiríamos el estado si es crítico.
    }
  };

  const handleLogout = async () => {
      await authService.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando tus finanzas...</p>
      </div>
    );
  }

  // Si no hay sesión, mostrar Login
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="bg-white/80 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl rotate-3 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Wallet size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">Finanzas<span className="text-indigo-600">AI</span></span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Gestión Personal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex bg-slate-100 rounded-full px-4 py-2 items-center gap-3 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Balance Total</span>
                <span className={`text-base font-black ${summary.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>S/. {summary.balance.toFixed(2)}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border-2 border-white shadow-sm overflow-hidden p-0.5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`} alt="User" className="rounded-full" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error / Offline Banner */}
        {(errorMsg || isOffline) && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in">
                <CloudOff size={20} className="text-orange-600" />
                <div>
                    <p className="font-bold text-sm">Modo Sin Conexión / Local</p>
                    <p className="text-xs opacity-80">
                      {errorMsg || "No se pudo conectar a Supabase (Tabla no encontrada). Tus datos se guardarán en este dispositivo temporalmente."}
                    </p>
                </div>
            </div>
        )}
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Income Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <ArrowUpRight size={22} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+ INGRESOS</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Ingresos</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">S/. {summary.totalIncome.toLocaleString()}</h3>
          </div>

          {/* Expense Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 group-hover:bg-rose-100 transition-colors">
                <ArrowDownRight size={22} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">- GASTOS</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Gastos</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">S/. {summary.totalExpense.toLocaleString()}</h3>
          </div>

          {/* Variable Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <ShoppingBag size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
                <div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Variables</p>
                     <h3 className="text-2xl font-black text-slate-800">S/. {summary.variableExpenses.toLocaleString()}</h3>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Fijos</p>
                    <h3 className="text-lg font-bold text-slate-500">S/. {summary.fixedExpenses.toLocaleString()}</h3>
                </div>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <PiggyBank size={22} strokeWidth={2.5} />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${summary.savingsRate > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                {summary.savingsRate > 0 ? 'SALUDABLE' : 'ATENCIÓN'}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Tasa de Ahorro</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{summary.savingsRate.toFixed(1)}%</h3>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start h-auto xl:h-[700px]">
          
          {/* Left: Input & Savings (4 cols) */}
          <div className="xl:col-span-3 flex flex-col gap-6 h-full">
            <div className="flex-none">
                <SavingsGoal currentSavings={summary.balance > 0 ? summary.balance : 0} />
            </div>
            <div className="flex-1 min-h-[400px]">
                <TransactionForm onAddTransaction={addTransaction} />
            </div>
          </div>

          {/* Middle: Transactions & AI (6 cols) */}
          <div className="xl:col-span-6 flex flex-col gap-6 h-full">
            <div className="flex-1 min-h-[350px] bg-white rounded-3xl shadow-sm border border-slate-100">
                 <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </div>
             <div className="flex-none h-[300px]">
                 <AIAdvisor transactions={transactions} />
             </div>
          </div>

          {/* Right: Charts (2 cols) */}
          <div className="xl:col-span-3 h-full min-h-[400px]">
             <FinancialChart transactions={transactions} />
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;