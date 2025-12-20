
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Target, Settings, Plus, Flame, Wallet, BookOpen, Search, Bell } from 'lucide-react';
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
import { Transaction, TransactionType, FinancialSummary, Account, Goal, Subscription, Category, Snap } from './types';
import { transactionService } from './services/transactionService';
import { authService } from './services/authService';
import { generateDailySnaps } from './services/geminiService';

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'analysis' | 'assets' | 'goals' | 'education' | 'settings'>('dashboard');
  const [showTxModal, setShowTxModal] = useState(false);
  const [showSnaps, setShowSnaps] = useState(false); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
      const [txs, accs, gls, subs] = await Promise.all([
          transactionService.getAll(userId),
          transactionService.getAccounts(userId),
          transactionService.getGoals(userId),
          transactionService.getSubscriptions(userId)
      ]);
      setTransactions(txs || []); setAccounts(accs || []); setGoals(gls || []); setSubscriptions(subs || []);
      const calcStreak = calculateStreak(txs || []);
      setStreak(calcStreak);
      setDailySnaps(generateDailySnaps(gls || [], calcStreak));
    } catch (e) { addNotification('error', 'Error de sincronización'); } 
    finally { 
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface">
          <Mascot variant="thinking" size={120} className="animate-float mb-6" />
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">FinanzasAI</h2>
          <p className="text-slate-500 font-medium animate-pulse">Sincronizando tus datos...</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email;

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
        <TransactionForm isOpen={showTxModal} onClose={() => setShowTxModal(false)} userId={session.user.id} onAddTransaction={async (tx) => { await transactionService.add(session.user.id, tx); loadAllData(session.user.id); addNotification('success', 'Movimiento guardado'); }} />
        
        {showSnaps && <FinnySnaps snaps={dailySnaps} onClose={() => setShowSnaps(false)} userId={session.user.id} userMetadata={session.user.user_metadata} onRefreshData={() => loadAllData(session.user.id)} />}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 p-4 h-screen sticky top-0 z-40">
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
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-[100dvh] overflow-y-auto custom-scrollbar relative bg-surface">
             <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-32 lg:pb-12">
                 
                 {/* Desktop Header */}
                 <header className="hidden lg:flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-black text-slate-900">{getPageTitle()}</h1>
                        <p className="text-xs text-slate-500 font-medium">Hola, {displayName.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('settings')}>
                        <div className="text-right">
                            <p className="font-bold text-xs group-hover:text-brand-600 transition-colors">{displayName}</p>
                            <p className="text-[10px] text-slate-400">S/. {summary.balance.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden group-hover:shadow-md transition-all">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                 </header>

                 {/* Mobile Header */}
                 <header className="lg:hidden flex justify-between items-center mb-6 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                            <Mascot variant="happy" size={32} />
                        </div>
                        <div>
                            <h1 className="text-lg font-heading font-black text-slate-900">{getPageTitle()}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{displayName.split(' ')[0]}</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveView('settings')} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                         <Bell size={20} />
                    </button>
                 </header>

                 <div className="space-y-6">
                    {activeView === 'dashboard' && (
                        <div className="space-y-6">
                            <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                            
                            <div className="lg:hidden">
                                <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Balance Total</p>
                                        <h2 className="text-3xl font-heading font-black">S/. {summary.balance.toLocaleString()}</h2>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                                            <Mascot variant="thinking" size={16} />
                                            <span>Proyectado mes: S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Wallet size={120} />
                                    </div>
                                </div>
                            </div>

                            <AccountsWidget accounts={accounts} onAddAccount={async (a) => { await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id); }} onTransfer={async (f,t,a) => { await transactionService.transfer(session.user.id, f, t, a); loadAllData(session.user.id); }} />
                            
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                <div className="xl:col-span-8 space-y-6">
                                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-soft">
                                        <FinancialChart transactions={transactions} />
                                    </div>
                                    <TransactionList transactions={transactions} onDelete={async (id) => { await transactionService.delete(session.user.id, id); loadAllData(session.user.id); }} />
                                    <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { await transactionService.addSubscription(session.user.id, s); loadAllData(session.user.id); }} />
                                </div>
                                <div className="xl:col-span-4 space-y-6 sticky top-24">
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
                    {activeView === 'goals' && <GoalsSection goals={goals} onAddGoal={async (g) => { await transactionService.addGoal(session.user.id, g); loadAllData(session.user.id); }} onUpdateGoal={async (id, a) => { await transactionService.updateGoalAmount(session.user.id, id, a); loadAllData(session.user.id); }} />}
                    {activeView === 'education' && <EducationView transactions={transactions} />}
                    {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={() => loadAllData(session.user.id)} />}
                 </div>
             </div>
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-40 flex justify-between items-center border border-white/50">
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
                        ? 'bg-brand-600 text-white w-14 h-14 rounded-full shadow-lg shadow-brand-500/30 -mt-1 w-14 h-14 active:scale-90' 
                        : 'w-12 h-12 rounded-full'
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
