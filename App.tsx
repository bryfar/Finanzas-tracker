
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Target, Settings, Plus, Wallet, BookOpen, Bell, Sparkles, CalendarClock, Zap } from 'lucide-react';
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
    } catch (e) { 
        addNotification('error', 'Error al sincronizar datos'); 
    } finally { 
        setIsSyncing(false); 
        setIsInitializing(false);
    }
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
    setSummary({ totalIncome: income, totalExpense: expense, balance: totalNetWorth, savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0, fixedExpenses: 0, variableExpenses: 0, projectedBalance: projected });
  }, [transactions, accounts]);

  const addNotification = (type: 'success'|'error'|'info', message: string) => {
      setNotifications(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  const handleAddTransaction = async (newTx: any) => {
      await transactionService.add(session.user.id, newTx);
      addNotification('success', 'Movimiento guardado con éxito');
      loadAllData(session.user.id);
  };

  if (!session && !isInitializing) return <Auth />;
  if (isSyncing || isInitializing) return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
          <Mascot variant="thinking" size={120} className="animate-float" />
          <p className="mt-6 text-slate-500 font-bold animate-pulse">Organizando tus finanzas...</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email || 'seed';

  return (
    <div className="h-[100dvh] bg-surface font-sans text-slate-800 flex flex-col lg:flex-row overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id) => setNotifications(p => p.filter(n => n.id !== id))} />
        
        <TransactionForm 
          isOpen={showTxModal} 
          onClose={() => setShowTxModal(false)} 
          userId={session.user.id} 
          onAddTransaction={handleAddTransaction} 
        />
        
        {showRecModal && <RecurringForm userId={session.user.id} onClose={() => setShowRecModal(false)} onAdded={() => loadAllData(session.user.id)} />}
        
        {showSnaps && (
            <FinnySnaps 
                snaps={dailySnaps} 
                onClose={() => setShowSnaps(false)} 
                userId={session.user.id} 
                userMetadata={session.user.user_metadata} 
                onRefreshData={() => loadAllData(session.user.id)} 
            />
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 p-6 h-screen border-r border-slate-100 bg-white">
            <div className="flex items-center gap-3 mb-12 cursor-default group">
               <div className="p-1 bg-brand-50 rounded-2xl group-hover:bg-brand-100 transition-colors">
                  <Mascot variant="idle" size={56} />
               </div>
               <span className="font-heading font-black text-2xl text-slate-900 tracking-tighter">Finanzas<span className="text-brand-500">AI</span></span>
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
                    <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-heading font-bold text-sm transition-all ${activeView === item.id ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <item.icon size={20} /> {item.label}
                    </button>
                ))}
            </nav>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden shrink-0 pt-safe px-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
                <div onClick={() => setActiveView('settings')} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 overflow-hidden active:scale-90 transition-transform">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-lg font-heading font-black text-slate-900 leading-none">Mi Billetera</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{displayName}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setShowRecModal(true)} 
                  className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center text-brand-600 shadow-sm active:scale-90 active:bg-brand-50 transition-all group"
                  title="Programación de finanzas"
                >
                    <CalendarClock size={22} className="group-hover:rotate-12" />
                    <span className="text-[6px] font-black uppercase mt-0.5">Programar</span>
                </button>
                <button className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90"><Bell size={20} /></button>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="max-w-4xl mx-auto px-6 pt-6 pb-40 lg:py-12 space-y-10">
                {activeView === 'dashboard' && (
                    <div className="space-y-10">
                        <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                        
                        <div className="bg-brand-600 rounded-[2.8rem] p-10 text-white shadow-2xl shadow-brand-500/25 relative overflow-hidden group active:scale-[0.99] transition-transform">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2 opacity-60">
                                  <Zap size={14} fill="currentColor" />
                                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Mi Balance Disponible</p>
                                </div>
                                <h2 className="text-6xl font-heading font-black tracking-tight leading-none">S/. {summary.balance.toLocaleString()}</h2>
                                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm">
                                    <Sparkles size={14} className="text-amber-300" />
                                    <span>Cierre mes estimado: <span className="text-white">S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-hover:scale-110 duration-700">
                                <Wallet size={220} />
                            </div>
                        </div>

                        <AccountsWidget accounts={accounts} onAddAccount={async (a) => { 
                            await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id);
                        }} onTransfer={async (f,t,a) => { 
                            await transactionService.transfer(session.user.id, f, t, a); loadAllData(session.user.id);
                        }} />

                        <UpcomingBills recurring={recurring} onProcess={async (rec) => {
                            await transactionService.add(session.user.id, {
                                amount: rec.amount, type: rec.type, category: rec.category, description: `Pago Programado: ${rec.name}`,
                                date: new Date().toISOString().split('T')[0], isFixed: true, accountId: rec.accountId
                            });
                            await transactionService.markRecurringProcessed(session.user.id, rec.id, new Date().toISOString().slice(0, 7));
                            addNotification('success', `Se registró el pago de ${rec.name}`);
                            loadAllData(session.user.id);
                        }} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-7 space-y-10">
                                <FinancialChart transactions={transactions} />
                                <TransactionList transactions={transactions} onDelete={async (id) => { 
                                    await transactionService.delete(session.user.id, id); loadAllData(session.user.id); 
                                }} />
                            </div>
                            <div className="lg:col-span-5 space-y-10">
                                <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val) => {
                                    const diff = val - summary.balance;
                                    if (diff !== 0) {
                                        await transactionService.add(session.user.id, { amount: Math.abs(diff), type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE, description: 'Ajuste Manual de Bóveda', date: new Date().toISOString().split('T')[0], isFixed: false, category: Category.OTHER });
                                        loadAllData(session.user.id);
                                    }
                                }} />
                                <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { 
                                    await transactionService.addSubscription(session.user.id, s); loadAllData(session.user.id); 
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

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-2.5 z-40 flex justify-between items-center border border-white/50 mb-safe scale-100 hover:scale-[1.02] transition-transform">
             {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
                { id: 'analysis', icon: BarChart3, label: 'Análisis' },
                { id: 'add', icon: Plus, main: true },
                { id: 'goals', icon: Target, label: 'Metas' },
                { id: 'assets', icon: Wallet, label: 'Inversiones' },
             ].map(item => (
                 <button 
                    key={item.id} 
                    onClick={() => item.main ? setShowTxModal(true) : setActiveView(item.id as any)} 
                    className={`relative flex flex-col items-center justify-center transition-all ${
                        item.main 
                        ? 'bg-slate-900 text-white w-16 h-16 rounded-[2rem] shadow-2xl -mt-12 border-[6px] border-surface active:scale-90 active:rotate-90' 
                        : 'w-12 h-12 rounded-2xl active:bg-slate-100'
                    }`}
                 >
                     <item.icon size={item.main ? 30 : 22} className={!item.main && activeView === item.id ? 'text-brand-600' : 'text-slate-400'} strokeWidth={item.main ? 3 : 2.5} />
                     {!item.main && activeView === item.id && (
                         <span className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></span>
                     )}
                 </button>
             ))}
        </nav>
    </div>
  );
}

export default App;
