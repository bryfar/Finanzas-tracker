
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Target, Settings, Plus, Flame, Wallet, BookOpen, Search, Bell, Sparkles, CalendarClock } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialChart from './components/FinancialChart';
import AIAdvisor from './components/AIAdvisor';
import SavingsGoal from './components/SavingsGoal';
import AccountsWidget from './components/AccountsWidget';
import GoalsSection from './components/GoalsSection';
import SubscriptionTracker from './components/SubscriptionTracker';
import AnalysisView from './components/AnalysisView';
import AssetsView from './components/AssetsView';
import EducationView from './components/EducationView';
import Auth from './components/Auth';
import SettingsView from './components/SettingsView';
import NotificationToast, { Notification } from './components/NotificationToast';
import Mascot from './components/Mascot';
import StoriesBar from './components/StoriesBar'; 
import FinnySnaps from './components/FinnySnaps'; 
import UpcomingBills from './components/UpcomingBills';
import RecurringForm from './components/RecurringForm';
import { Transaction, TransactionType, FinancialSummary, Account, Goal, Subscription, Category, Snap, RecurringTransaction } from './types';
import { transactionService } from './services/transactionService';
import { authService } from './services/authService';
import { generateDailySnaps } from './services/geminiService';

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'analysis' | 'assets' | 'goals' | 'education' | 'settings'>('dashboard');
  const [showTxModal, setShowTxModal] = useState(false);
  const [showRecModal, setShowRecModal] = useState(false);
  const [showSnaps, setShowSnaps] = useState(false); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [streak, setStreak] = useState(0);
  const [summary, setSummary] = useState<FinancialSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0, fixedExpenses: 0, variableExpenses: 0, projectedBalance: 0 });
  const [dailySnaps, setDailySnaps] = useState<Snap[]>([]);

  const [isSyncing, setIsSyncing] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => { 
        setSession(s); 
        if (!s) { setIsInitializing(false); setIsSyncing(false); }
    });
    const { data } = authService.onAuthStateChange((_, s) => { 
        setSession(s); 
        if(!s) { 
            setTransactions([]); 
            setIsInitializing(false); 
            setIsSyncing(false); 
        }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => { 
      if (session?.user?.id) {
          setIsSyncing(true);
          loadAllData(session.user.id);
      } 
  }, [session]);

  const loadAllData = async (userId: string) => {
    try {
      const [txs, accs, gls, subs, recs] = await Promise.all([
          transactionService.getAll(userId),
          transactionService.getAccounts(userId),
          transactionService.getGoals(userId),
          transactionService.getSubscriptions(userId),
          transactionService.getRecurring(userId)
      ]);
      setTransactions(txs || []); setAccounts(accs || []); setGoals(gls || []); setSubscriptions(subs || []);
      setRecurring(recs || []);
      
      const calcStreak = calculateStreak(txs || []);
      setStreak(calcStreak);
      setDailySnaps(generateDailySnaps(gls || [], calcStreak));

      // Procesar automáticos
      processRecurring(userId, recs || []);
      
    } catch (e) { 
        addNotification('error', 'Error al sincronizar datos'); 
    } finally { 
        setIsSyncing(false); 
        setIsInitializing(false);
    }
  };

  const processRecurring = async (userId: string, recs: RecurringTransaction[]) => {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.toISOString().slice(0, 7);
      let count = 0;

      for (const rec of recs) {
          if (rec.isAuto && rec.dayOfMonth <= currentDay && rec.lastProcessedMonth !== currentMonth) {
              await transactionService.add(userId, {
                  amount: rec.amount,
                  type: rec.type,
                  category: rec.category,
                  description: `${rec.name} (Auto)`,
                  date: today.toISOString().split('T')[0],
                  isFixed: true,
                  accountId: rec.accountId
              });
              await transactionService.markRecurringProcessed(userId, rec.id, currentMonth);
              count++;
          }
      }

      if (count > 0) {
          addNotification('success', `Finny registró ${count} cobros/pagos automáticos.`);
          const freshTxs = await transactionService.getAll(userId);
          const freshRecs = await transactionService.getRecurring(userId);
          setTransactions(freshTxs);
          setRecurring(freshRecs);
      }
  };

  const handleManualProcess = async (rec: RecurringTransaction) => {
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7);
      
      await transactionService.add(session.user.id, {
          amount: rec.amount,
          type: rec.type,
          category: rec.category,
          description: rec.name,
          date: today.toISOString().split('T')[0],
          isFixed: true,
          accountId: rec.accountId
      });
      await transactionService.markRecurringProcessed(session.user.id, rec.id, currentMonth);
      addNotification('success', `¡Listo! ${rec.name} registrado.`);
      loadAllData(session.user.id);
  };

  const calculateStreak = (txs: Transaction[]) => {
      if (txs.length === 0) return 0;
      const uniqueDates = Array.from(new Set(txs.map(t => t.date))).sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let checkDate = uniqueDates.includes(today) ? today : (uniqueDates.includes(yesterday) ? yesterday : null);
      if (!checkDate) return 0;
      let currentStreak = 0;
      for (let i = 0; i < uniqueDates.length; i++) {
         const d = new Date(checkDate);
         d.setDate(d.getDate() - i);
         const expectedStr = d.toISOString().split('T')[0];
         if (uniqueDates.includes(expectedStr)) currentStreak++;
         else break;
      }
      return currentStreak;
  };

  useEffect(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate();
    const avgDailyNet = (income - expense) / Math.max(1, today.getDate());
    const projected = totalNetWorth + (avgDailyNet * daysLeft);

    setSummary({ 
        totalIncome: income, 
        totalExpense: expense, 
        balance: totalNetWorth, 
        savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0, 
        fixedExpenses: 0, 
        variableExpenses: 0,
        projectedBalance: projected
    });
  }, [transactions, accounts]);

  const addNotification = (type: 'success'|'error'|'info', message: string) => {
      setNotifications(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  if (!session && !isInitializing) return <Auth />;
  
  if (isSyncing || isInitializing) return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface pt-safe pb-safe pl-safe pr-safe">
          <Mascot variant="thinking" size={120} className="animate-float mb-6" />
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-2 text-center px-4">FinanzasAI</h2>
          <p className="text-slate-500 font-medium animate-pulse text-center px-4">Sincronizando tus datos financieros...</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email || 'seed';

  const getPageTitle = () => {
    switch(activeView) {
        case 'analysis': return 'Análisis';
        case 'assets': return 'Inversiones';
        case 'goals': return 'Metas';
        case 'education': return 'Educación';
        case 'settings': return 'Ajustes';
        default: return 'Inicio';
    }
  };

  return (
    <div className="min-h-[100dvh] bg-surface font-sans text-slate-800 flex overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id) => setNotifications(p => p.filter(n => n.id !== id))} />
        <TransactionForm isOpen={showTxModal} onClose={() => setShowTxModal(false)} userId={session.user.id} onAddTransaction={async (tx) => { 
            await transactionService.add(session.user.id, tx); 
            loadAllData(session.user.id); 
            addNotification('success', '¡Movimiento guardado!'); 
        }} />
        
        {showRecModal && <RecurringForm userId={session.user.id} onClose={() => setShowRecModal(false)} onAdded={() => loadAllData(session.user.id)} />}

        {showSnaps && <FinnySnaps snaps={dailySnaps} onClose={() => setShowSnaps(false)} userId={session.user.id} userMetadata={session.user.user_metadata} onRefreshData={() => {
            loadAllData(session.user.id);
            addNotification('success', '¡Ahorro rápido completado!');
        }} />}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 p-4 h-screen sticky top-0 z-40 pl-safe">
            <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100/50 h-full flex flex-col p-6 overflow-hidden">
                 <div className="flex items-center gap-3 mb-8">
                    <Mascot variant="idle" size={48} />
                    <span className="font-heading font-black text-xl text-slate-900 tracking-tight">Finanzas<span className="text-brand-500">AI</span></span>
                 </div>
                 <nav className="space-y-1 flex-1">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
                        { id: 'analysis', icon: BarChart3, label: 'Análisis' },
                        { id: 'assets', icon: Wallet, label: 'Inversiones' },
                        { id: 'goals', icon: Target, label: 'Metas' },
                        { id: 'education', icon: BookOpen, label: 'Educación' },
                        { id: 'settings', icon: Settings, label: 'Ajustes' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-heading font-bold text-xs transition-all ${activeView === item.id ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <item.icon size={18} /> <span>{item.label}</span>
                        </button>
                    ))}
                 </nav>
                 <button onClick={() => setShowRecModal(true)} className="mt-4 w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-heading font-black text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all">
                    <CalendarClock size={18} /> <span>Programar Fijo</span>
                 </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-[100dvh] overflow-y-auto custom-scrollbar relative bg-surface">
             <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-32 lg:pb-12 pt-safe pl-safe pr-safe">
                 
                 {/* Desktop Header */}
                 <header className="hidden lg:flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-black text-slate-900">{getPageTitle()}</h1>
                        <p className="text-xs text-slate-500 font-medium">Hola, {displayName.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowRecModal(true)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-500 hover:shadow-md transition-all">
                            <CalendarClock size={20} />
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('settings')}>
                            <div className="text-right">
                                <p className="font-bold text-xs group-hover:text-brand-600 transition-colors">{displayName}</p>
                                <p className="text-[10px] text-slate-400">S/. {summary.balance.toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden group-hover:shadow-md transition-all">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=f8fafc`} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                 </header>

                 {/* Mobile Header */}
                 <header className="lg:hidden flex justify-between items-center mb-6 pt-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-[1rem] bg-white border border-slate-100 flex items-center justify-center overflow-hidden active:scale-95 transition-transform" onClick={() => setActiveView('settings')}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=ffffff`} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-heading font-black text-slate-900 leading-none truncate">{getPageTitle()}</h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1 truncate">{displayName.split(' ')[0]}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowRecModal(true)} className="w-10 h-10 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                             <CalendarClock size={20} />
                        </button>
                        <button onClick={() => addNotification('info', '¡Finny está vigilando!')} className="w-10 h-10 shrink-0 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                             <Bell size={20} />
                        </button>
                    </div>
                 </header>

                 <div className="space-y-6">
                    {activeView === 'dashboard' && (
                        <div className="space-y-6">
                            <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                            
                            {/* Alertas de Programados */}
                            <UpcomingBills recurring={recurring} onProcess={handleManualProcess} />

                            <div className="lg:hidden">
                                <div className="bg-brand-600 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden active:scale-[0.98] transition-transform">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Mi Balance</p>
                                        <h2 className="text-4xl font-heading font-black">S/. {summary.balance.toLocaleString()}</h2>
                                        <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                            <Sparkles size={12} className="text-amber-300" />
                                            <span>Sugerencia: S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} al cierre</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                        <Wallet size={160} />
                                    </div>
                                </div>
                            </div>

                            <AccountsWidget accounts={accounts} onAddAccount={async (a) => { 
                                await transactionService.addAccount(session.user.id, a); 
                                loadAllData(session.user.id);
                                addNotification('success', 'Nueva cuenta configurada');
                            }} onTransfer={async (f,t,a) => { 
                                await transactionService.transfer(session.user.id, f, t, a); 
                                loadAllData(session.user.id);
                                addNotification('success', 'Transferencia realizada');
                            }} />
                            
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                <div className="xl:col-span-8 space-y-6">
                                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-soft">
                                        <FinancialChart transactions={transactions} />
                                    </div>
                                    <TransactionList transactions={transactions} onDelete={async (id) => { 
                                        await transactionService.delete(session.user.id, id); 
                                        loadAllData(session.user.id); 
                                        addNotification('info', 'Movimiento eliminado');
                                    }} />
                                    <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { 
                                        await transactionService.addSubscription(session.user.id, s); 
                                        loadAllData(session.user.id); 
                                        addNotification('success', 'Suscripción registrada');
                                    }} />
                                </div>
                                <div className="xl:col-span-4 space-y-6 sticky top-24">
                                    <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val) => {
                                        const diff = val - summary.balance;
                                        if (diff !== 0) {
                                            await transactionService.add(session.user.id, { amount: Math.abs(diff), type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE, description: 'Ajuste Manual', date: new Date().toISOString().split('T')[0], isFixed: false, category: Category.OTHER });
                                            loadAllData(session.user.id);
                                            addNotification('info', 'Balance ajustado manualmente');
                                        }
                                    }} />
                                    <AIAdvisor transactions={transactions} streak={streak} />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeView === 'analysis' && <AnalysisView transactions={transactions} subscriptions={subscriptions} userId={session.user.id} />}
                    {activeView === 'assets' && <AssetsView accounts={accounts} userId={session.user.id} />}
                    {activeView === 'goals' && <GoalsSection goals={goals} onAddGoal={async (g) => { 
                        await transactionService.addGoal(session.user.id, g); 
                        loadAllData(session.user.id); 
                        addNotification('success', '¡Nueva meta creada!');
                    }} onUpdateGoal={async (id, a) => { 
                        await transactionService.updateGoalAmount(session.user.id, id, a); 
                        loadAllData(session.user.id); 
                    }} />}
                    {activeView === 'education' && <EducationView transactions={transactions} />}
                    {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={() => {
                        loadAllData(session.user.id);
                        addNotification('success', 'Perfil actualizado');
                    }} />}
                 </div>
             </div>
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-40 flex justify-between items-center border border-white/50 mb-safe">
             {[
                { id: 'dashboard', icon: LayoutDashboard },
                { id: 'analysis', icon: BarChart3 },
                { id: 'add', icon: Plus, main: true },
                { id: 'goals', icon: Target },
                { id: 'assets', icon: Wallet },
             ].map(item => (
                 <button 
                    key={item.id} 
                    onClick={() => item.main ? setShowTxModal(true) : setActiveView(item.id as any)} 
                    className={`relative flex items-center justify-center transition-all ${
                        item.main 
                        ? 'bg-brand-600 text-white w-14 h-14 rounded-[1.8rem] shadow-lg shadow-brand-500/30 -mt-10 border-4 border-surface active:scale-90' 
                        : 'w-12 h-12 rounded-full active:bg-slate-100'
                    }`}
                 >
                     <item.icon size={item.main ? 28 : 22} className={!item.main && activeView === item.id ? 'text-brand-600 scale-110' : 'text-slate-400'} />
                     {!item.main && activeView === item.id && (
                         <span className="absolute -bottom-1 w-1 h-1 bg-brand-600 rounded-full"></span>
                     )}
                 </button>
             ))}
        </nav>
    </div>
  );
}

export default App;
