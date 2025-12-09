import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Target, Settings, Plus, Flame, Wallet, BookOpen } from 'lucide-react';
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
  
  // Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [streak, setStreak] = useState(0);
  const [summary, setSummary] = useState<FinancialSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, savingsRate: 0, fixedExpenses: 0, variableExpenses: 0, projectedBalance: 0 });
  const [dailySnaps, setDailySnaps] = useState<Snap[]>([]);

  // States for Sync Flow
  const [isSyncing, setIsSyncing] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Init Auth
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

  // Trigger Sync on Login
  useEffect(() => { 
      if (session?.user?.id) {
          setIsSyncing(true);
          setTimeout(() => loadAllData(session.user.id), 1500);
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
      setTransactions(txs); setAccounts(accs); setGoals(gls); setSubscriptions(subs);
      
      const calcStreak = calculateStreak(txs);
      setStreak(calcStreak);
      
      // [NUEVO 🔥] Generate Snaps based on fresh data
      setDailySnaps(generateDailySnaps(gls, calcStreak));

    } catch (e) { addNotification('error', 'Error de sincronización'); } 
    finally { 
        setIsSyncing(false); 
        setIsInitializing(false);
    }
  };

  const handleUpdateProfile = async () => {
      // Force refresh of the session to get new metadata
      const newSession = await authService.refreshSession();
      setSession(newSession);
      addNotification('success', 'Perfil actualizado correctamente');
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

  const addNotification = (type: 'success'|'error'|'info', message: string) => {
      setNotifications(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  const handleAddTransaction = async (newTx: any) => {
      await transactionService.add(session.user.id, newTx);
      addNotification('success', 'Movimiento guardado');
      loadAllData(session.user.id);
  };

  if (!session && !isInitializing) return <Auth />;
  
  if (isSyncing || isInitializing) return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-50/50"></div>
          <div className="relative z-10 flex flex-col items-center">
             <Mascot variant="thinking" size={120} className="animate-float mb-6" />
             <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Sincronizando...</h2>
             <p className="text-slate-500 font-medium animate-pulse">Finny está organizando tus cuentas</p>
             <div className="mt-8 w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
             </div>
          </div>
          <style>{`@keyframes loading { 0% { width: 0%; transform: translateX(-100%); } 100% { width: 100%; transform: translateX(100%); } }`}</style>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email;

  return (
    <div className="min-h-[100dvh] bg-surface font-sans text-slate-800 flex overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id) => setNotifications(p => p.filter(n => n.id !== id))} />
        <TransactionForm isOpen={showTxModal} onClose={() => setShowTxModal(false)} userId={session.user.id} onAddTransaction={handleAddTransaction} />
        
        {/* [NUEVO 🔥] Finny Snaps Modal */}
        {showSnaps && (
            <FinnySnaps 
                snaps={dailySnaps} 
                onClose={() => setShowSnaps(false)} 
                userId={session.user.id} 
                userMetadata={session.user.user_metadata}
                onRefreshData={() => loadAllData(session.user.id)}
            />
        )}

        {/* Floating Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-80 p-6 h-screen sticky top-0 z-40">
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100/50 h-full flex flex-col p-8 relative overflow-hidden backdrop-blur-xl transition-all hover:shadow-xl">
                 <div className="flex items-center gap-4 mb-10 relative z-10 group cursor-default">
                     <div className="w-14 h-14 relative transition-transform group-hover:scale-110 duration-300">
                        <div className="absolute inset-0 bg-brand-200 rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity"></div>
                        <Mascot variant="idle" size={56} className="relative z-10" />
                     </div>
                     <div>
                        <span className="font-heading font-black text-2xl tracking-tight block text-slate-900 leading-none">Finanzas<span className="text-brand-500">AI</span></span>
                        <span className="text-[10px] text-brand-500 font-bold uppercase tracking-[0.2em] bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1">Premium</span>
                     </div>
                 </div>

                 <nav className="space-y-2 flex-1 relative z-10">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
                        { id: 'analysis', icon: BarChart3, label: 'Análisis' },
                        { id: 'assets', icon: Wallet, label: 'Patrimonio' },
                        { id: 'goals', icon: Target, label: 'Metas' },
                        { id: 'education', icon: BookOpen, label: 'Educación' },
                        { id: 'settings', icon: Settings, label: 'Ajustes' },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-heading font-bold text-sm transition-all duration-300 group relative overflow-hidden ${activeView === item.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <item.icon size={20} className={`transition-transform duration-300 relative z-10 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} /> 
                            <span className="relative z-10">{item.label}</span>
                        </button>
                    ))}
                 </nav>

                 <div className="mt-auto relative z-10">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-5 flex items-center gap-4 border border-orange-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => setShowSnaps(true)}>
                        <div className="absolute -right-4 -top-4 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                            <Flame size={80} />
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl text-orange-500 shadow-sm flex items-center justify-center relative z-10">
                            <Flame size={24} fill="currentColor" className="animate-pulse" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Modo Racha</p>
                            <p className="font-heading font-black text-orange-600 text-xl">{streak} Días</p>
                        </div>
                    </div>
                 </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-[100dvh] overflow-y-auto custom-scrollbar relative scroll-smooth">
             <div className="p-4 lg:p-10 max-w-[1600px] mx-auto pb-48 lg:pb-12">
                 
                 {/* Mobile Header */}
                 <div className="lg:hidden flex justify-between items-center mb-6 sticky top-0 bg-surface/80 backdrop-blur-xl z-30 py-4 px-2 -mx-2 border-b border-slate-100/50">
                     <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                             <Mascot variant="idle" size={40} />
                         </div>
                         <div>
                             <p className="font-heading font-bold text-slate-400 text-[10px] uppercase mb-0.5 tracking-wider">Buenos días,</p>
                             <h1 className="font-heading font-black text-xl text-slate-900 leading-none truncate max-w-[150px]">{displayName.split(' ')[0]}</h1>
                         </div>
                     </div>
                     <div className="w-11 h-11 bg-white rounded-2xl border border-slate-100 p-0.5 shadow-sm overflow-hidden active:scale-95 transition-transform" onClick={() => setActiveView('settings')}>
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} className="rounded-xl bg-slate-50 w-full h-full object-cover" />
                     </div>
                 </div>

                 {/* Dynamic View Content */}
                 <div className="space-y-8 animate-slide-up">
                    {activeView === 'dashboard' && (
                        <div className="space-y-8">
                            
                            {/* [NUEVO 🔥] Stories Bar */}
                            <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />

                            {/* AI Projection Text */}
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 text-sm text-indigo-800 font-medium">
                                <Mascot variant="thinking" size={30} />
                                <p>A este ritmo, cerrarás el mes con aprox. <span className="font-black">S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>.</p>
                            </div>

                            <AccountsWidget accounts={accounts} onAddAccount={async (a) => { await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id); }} onTransfer={async (f,t,a) => { await transactionService.transfer(session.user.id, f, t, a); loadAllData(session.user.id); }} />
                            
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                <div className="xl:col-span-8 space-y-10">
                                    <div className="md:h-[400px] h-[300px]"><FinancialChart transactions={transactions} /></div>
                                    <TransactionList transactions={transactions} onDelete={async (id) => { await transactionService.delete(session.user.id, id); loadAllData(session.user.id); }} />
                                </div>
                                
                                <div className="xl:col-span-4 space-y-8 sticky top-10">
                                    <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val) => {
                                        const diff = val - summary.balance;
                                        if (diff !== 0) {
                                            await transactionService.add(session.user.id, {
                                                amount: Math.abs(diff),
                                                type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
                                                description: 'Ajuste de Saldo Manual',
                                                date: new Date().toISOString().split('T')[0],
                                                isFixed: false,
                                                category: Category.OTHER
                                            });
                                            loadAllData(session.user.id);
                                        }
                                    }} />
                                    <div className="h-[600px]"><AIAdvisor transactions={transactions} streak={streak} /></div>
                                    <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { await transactionService.addSubscription(session.user.id, s); loadAllData(session.user.id); }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeView === 'analysis' && <AnalysisView transactions={transactions} subscriptions={subscriptions} />}
                    {activeView === 'assets' && <AssetsView accounts={accounts} />}
                    {activeView === 'goals' && <GoalsSection goals={goals} onAddGoal={async (g) => { await transactionService.addGoal(session.user.id, g); loadAllData(session.user.id); }} onUpdateGoal={async (id, a) => { await transactionService.updateGoalAmount(session.user.id, id, a); loadAllData(session.user.id); }} />}
                    {activeView === 'education' && <EducationView transactions={transactions} />}
                    {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={handleUpdateProfile} />}
                 </div>
             </div>
        </main>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/10 p-2 z-40 flex justify-between items-center border border-slate-200/50">
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
                    className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${item.main ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 -mt-10 w-16 h-16 rounded-[2rem] active:scale-95 border-4 border-surface' : activeView === item.id ? 'text-brand-600 bg-brand-50' : 'text-slate-400'}`}
                 >
                     <item.icon size={item.main ? 32 : 24} strokeWidth={item.main ? 3 : 2.5} />
                     {activeView === item.id && !item.main && <span className="absolute -bottom-1 w-1 h-1 bg-brand-600 rounded-full animate-fade-in"></span>}
                 </button>
             ))}
        </div>
    </div>
  );
}

export default App;