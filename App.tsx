
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
          addNotification('success', `Finny registró ${count} movimientos automáticos.`);
          loadAllData(userId);
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
    const projected = totalNetWorth + ((income - expense) / Math.max(1, today.getDate()) * (daysInMonth - today.getDate()));

    setSummary({ 
        totalIncome: income, totalExpense: expense, balance: totalNetWorth, 
        savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0, 
        fixedExpenses: 0, variableExpenses: 0, projectedBalance: projected
    });
  }, [transactions, accounts]);

  const addNotification = (type: 'success'|'error'|'info', message: string) => {
      setNotifications(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  if (!session && !isInitializing) return <Auth />;
  
  if (isSyncing || isInitializing) return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
          <Mascot variant="thinking" size={140} className="animate-float mb-8" />
          <h2 className="text-3xl font-heading font-black text-slate-900 mb-2">FinanzasAI</h2>
          <p className="text-slate-500 font-medium animate-pulse">Sincronizando tu mundo financiero...</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email || 'seed';

  const getPageTitle = () => {
    switch(activeView) {
        case 'analysis': return 'Análisis';
        case 'assets': return 'Inversiones';
        case 'goals': return 'Metas';
        case 'education': return 'Academia';
        case 'settings': return 'Perfil';
        default: return 'Mi Billetera';
    }
  };

  return (
    <div className="h-[100dvh] bg-surface font-sans text-slate-800 flex flex-col lg:flex-row overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id) => setNotifications(p => p.filter(n => n.id !== id))} />
        <TransactionForm isOpen={showTxModal} onClose={() => setShowTxModal(false)} userId={session.user.id} onAddTransaction={async (tx) => { 
            await transactionService.add(session.user.id, tx); 
            loadAllData(session.user.id); 
            addNotification('success', '¡Movimiento guardado!'); 
        }} />
        
        {showRecModal && <RecurringForm userId={session.user.id} onClose={() => setShowRecModal(false)} onAdded={() => loadAllData(session.user.id)} />}
        {showSnaps && <FinnySnaps snaps={dailySnaps} onClose={() => setShowSnaps(false)} userId={session.user.id} userMetadata={session.user.user_metadata} onRefreshData={() => loadAllData(session.user.id)} />}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 p-6 h-screen border-r border-slate-100 bg-white">
            <div className="flex items-center gap-3 mb-12">
               <Mascot variant="idle" size={56} />
               <span className="font-heading font-black text-2xl text-slate-900 tracking-tighter">FinanzasAI</span>
            </div>
            <nav className="space-y-2 flex-1">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
                    { id: 'analysis', icon: BarChart3, label: 'Análisis' },
                    { id: 'assets', icon: Wallet, label: 'Inversiones' },
                    { id: 'goals', icon: Target, label: 'Metas' },
                    { id: 'education', icon: BookOpen, label: 'Educación' },
                    { id: 'settings', icon: Settings, label: 'Ajustes' },
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-heading font-bold text-sm transition-all ${activeView === item.id ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <item.icon size={20} /> {item.label}
                    </button>
                ))}
            </nav>
            <button onClick={() => setShowRecModal(true)} className="mt-6 w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest bg-slate-900 text-white shadow-xl active:scale-95 transition-all">
                <CalendarClock size={18} /> Programar Pago
            </button>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden shrink-0 pt-safe px-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
                <div onClick={() => setActiveView('settings')} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 overflow-hidden active:scale-90 transition-transform">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-lg font-heading font-black text-slate-900 leading-none">{getPageTitle()}</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Finanzas Personales</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowRecModal(true)} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90"><CalendarClock size={20} /></button>
                <button className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90"><Bell size={20} /></button>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="max-w-5xl mx-auto px-6 pt-6 pb-32 lg:py-12 space-y-8">
                
                {activeView === 'dashboard' && (
                    <div className="space-y-8">
                        <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                        
                        <UpcomingBills recurring={recurring} onProcess={handleManualProcess} />

                        {/* Balance Card Mobile Optimized */}
                        <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden group active:scale-[0.98] transition-all">
                            <div className="relative z-10 space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Balance General</p>
                                <h2 className="text-4xl font-heading font-black tracking-tight">S/. {summary.balance.toLocaleString()}</h2>
                                <div className="pt-6">
                                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                        <Sparkles size={12} className="text-amber-300" />
                                        <span>Proyección mes: S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                                <Wallet size={200} />
                            </div>
                        </div>

                        <AccountsWidget accounts={accounts} onAddAccount={async (a) => { 
                            await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id);
                        }} onTransfer={async (f,t,a) => { 
                            await transactionService.transfer(session.user.id, f, t, a); loadAllData(session.user.id);
                        }} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-7 space-y-8">
                                <FinancialChart transactions={transactions} />
                                <TransactionList transactions={transactions} onDelete={async (id) => { 
                                    await transactionService.delete(session.user.id, id); loadAllData(session.user.id); 
                                }} />
                                <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { 
                                    await transactionService.addSubscription(session.user.id, s); loadAllData(session.user.id); 
                                }} />
                            </div>
                            <div className="lg:col-span-5 space-y-8">
                                <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val) => {
                                    const diff = val - summary.balance;
                                    if (diff !== 0) {
                                        await transactionService.add(session.user.id, { amount: Math.abs(diff), type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE, description: 'Ajuste Manual', date: new Date().toISOString().split('T')[0], isFixed: false, category: Category.OTHER });
                                        loadAllData(session.user.id);
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
                    await transactionService.addGoal(session.user.id, g); loadAllData(session.user.id); 
                }} onUpdateGoal={async (id, a) => { 
                    await transactionService.updateGoalAmount(session.user.id, id, a); loadAllData(session.user.id); 
                }} />}
                {activeView === 'education' && <EducationView transactions={transactions} />}
                {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={() => loadAllData(session.user.id)} />}
            </div>
        </main>

        {/* Navigation Bar Mobile - Thumb Optimized */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-between items-center px-4 z-[100] border border-white/50 mb-safe">
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
                    className={`relative flex flex-col items-center justify-center transition-all ${item.main ? 'bg-slate-900 text-white w-16 h-16 rounded-3xl -mt-12 shadow-2xl border-4 border-surface active:scale-90' : 'w-12 h-12 rounded-2xl active:bg-slate-50'}`}
                 >
                     <item.icon size={item.main ? 30 : 22} className={!item.main && activeView === item.id ? 'text-brand-600' : 'text-slate-400'} />
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
