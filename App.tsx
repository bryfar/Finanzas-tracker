
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Target, Settings, Plus, Flame, Wallet, BookOpen, Search, Bell, KeyRound, Loader2, Save } from 'lucide-react';
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
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  
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
    // Detectar si venimos de un enlace de recuperación
    if (window.location.hash.includes('access_token') || window.location.search.includes('type=recovery')) {
        setIsRecovery(true);
    }

    const checkAuth = async () => {
        try {
            const s = await authService.getSession();
            setSession(s);
            if (!s) {
                setIsInitializing(false);
                setIsSyncing(false);
            }
        } catch (e) {
            console.error("Auth check failed:", e);
            setIsInitializing(false);
            setIsSyncing(false);
        }
    };
    
    checkAuth();

    const { data } = authService.onAuthStateChange((event, s) => { 
        setSession(s);
        if (event === 'PASSWORD_RECOVERY') {
            setIsRecovery(true);
        }
        if(!s) { 
            setTransactions([]); 
            setIsInitializing(false); 
            setIsSyncing(false); 
        }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    try {
        await authService.updatePassword(newPassword);
        addNotification('success', 'Contraseña actualizada correctamente');
        setIsRecovery(false);
        window.location.hash = ''; // Limpiar URL
        window.location.search = '';
    } catch (err: any) {
        addNotification('error', err.message || 'Error al actualizar contraseña');
    } finally {
        setRecoveryLoading(false);
    }
  };

  useEffect(() => { 
      if (session?.user?.id && !isRecovery) {
          setIsSyncing(true);
          loadAllData(session.user.id);
      } 
  }, [session, isRecovery]);

  const loadAllData = async (userId: string) => {
    try {
      const [txs, accs, gls, subs] = await Promise.all([
          transactionService.getAll(userId),
          transactionService.getAccounts(userId),
          transactionService.getGoals(userId),
          transactionService.getSubscriptions(userId)
      ]);
      setTransactions(txs || []); 
      setAccounts(accs || []); 
      setGoals(gls || []); 
      setSubscriptions(subs || []);
      setStreak(calculateStreak(txs || []));
      setDailySnaps(generateDailySnaps(gls || [], calculateStreak(txs || [])));
    } catch (e) { 
        console.error("Sync error:", e);
        addNotification('error', 'Error al conectar con la base de datos'); 
    } finally { 
        setIsSyncing(false); 
        setIsInitializing(false);
    }
  };

  const addNotification = (type: 'success'|'error'|'info', message: string) => {
      setNotifications(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  const handleAddTransaction = async (newTx: any) => {
      await transactionService.add(session.user.id, newTx);
      addNotification('success', 'Movimiento guardado');
      loadAllData(session.user.id);
  };

  const calculateStreak = (txs: Transaction[]) => {
      if (!txs || txs.length === 0) return 0;
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

  if (isRecovery) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-4">
                    <KeyRound size={32} />
                </div>
                <h1 className="text-2xl font-heading font-black text-slate-900">Nueva Contraseña</h1>
                <p className="text-slate-500 font-medium">Establece tu nuevo acceso seguro.</p>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-base" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={recoveryLoading} className="w-full btn-primary py-4 text-lg">
                    {recoveryLoading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2"><Save size={20}/> Guardar y Continuar</span>}
                </button>
            </form>
        </div>
    </div>
  );

  if (!session && !isInitializing) return <Auth />;
  
  if (isSyncing || isInitializing) return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface">
          <Mascot variant="thinking" size={120} className="animate-float mb-6" />
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Conectando...</h2>
          <p className="text-slate-500 font-medium animate-pulse">Sincronizando con Supabase</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
  const avatarSeed = session.user.user_metadata?.avatar_seed || session.user.email;

  return (
    <div className="min-h-[100dvh] bg-surface font-sans text-slate-800 flex overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id) => setNotifications(p => p.filter(n => n.id !== id))} />
        <TransactionForm isOpen={showTxModal} onClose={() => setShowTxModal(false)} userId={session.user.id} onAddTransaction={handleAddTransaction} />
        
        {showSnaps && (
            <FinnySnaps 
                snaps={dailySnaps} 
                onClose={() => setShowSnaps(false)} 
                userId={session.user.id} 
                userMetadata={session.user.user_metadata}
                onRefreshData={() => loadAllData(session.user.id)}
            />
        )}

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
                        { id: 'assets', icon: Wallet, label: 'Patrimonio' },
                        { id: 'goals', icon: Target, label: 'Metas' },
                        { id: 'education', icon: BookOpen, label: 'Educación' },
                        { id: 'settings', icon: Settings, label: 'Ajustes' },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id as any)}
                            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-heading font-bold text-xs transition-all ${activeView === item.id ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <item.icon size={18} /> 
                            <span>{item.label}</span>
                        </button>
                    ))}
                 </nav>
            </div>
        </aside>

        <main className="flex-1 h-[100dvh] overflow-y-auto custom-scrollbar relative bg-surface">
             <div className="p-4 lg:p-8 max-w-[1400px] mx-auto pb-48 lg:pb-12">
                 <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-black text-slate-900">
                          {activeView === 'dashboard' ? 'Panel Principal' : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Hola, {displayName.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('settings')}>
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-xs group-hover:text-brand-600 transition-colors">{displayName}</p>
                            <p className="text-[10px] text-slate-400">S/. {summary.balance.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden group-hover:shadow-md transition-all">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                 </header>

                 <div className="space-y-6">
                    {activeView === 'dashboard' && (
                        <div className="space-y-6">
                            <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center gap-4 text-sm text-indigo-800 font-medium">
                                <span className="text-xl">💡</span>
                                <p>Proyectamos que cerrarás el mes con <span className="font-black">S/. {summary.projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>.</p>
                            </div>
                            <AccountsWidget accounts={accounts} onAddAccount={async (a) => { await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id); }} onTransfer={async (f,t,a) => { await transactionService.transfer(session.user.id, f, t, a); loadAllData(session.user.id); }} />
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                                <div className="xl:col-span-8 space-y-6">
                                    <FinancialChart transactions={transactions} />
                                    <TransactionList transactions={transactions} onDelete={async (id) => { await transactionService.delete(session.user.id, id); loadAllData(session.user.id); }} />
                                    <SubscriptionTracker subscriptions={subscriptions} onAdd={async (s) => { await transactionService.addSubscription(session.user.id, s); loadAllData(session.user.id); }} />
                                </div>
                                <div className="xl:col-span-4 space-y-6 sticky top-24">
                                    <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val) => {
                                        const diff = val - summary.balance;
                                        if (diff !== 0) {
                                            await transactionService.add(session.user.id, {
                                                amount: Math.abs(diff),
                                                type: diff > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
                                                description: 'Ajuste Manual',
                                                date: new Date().toISOString().split('T')[0],
                                                isFixed: false,
                                                category: Category.OTHER
                                            });
                                            loadAllData(session.user.id);
                                        }
                                    }} />
                                    <AIAdvisor transactions={transactions} streak={streak} />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeView === 'analysis' && <AnalysisView transactions={transactions} subscriptions={subscriptions} />}
                    {activeView === 'assets' && <AssetsView accounts={accounts} />}
                    {activeView === 'goals' && <GoalsSection goals={goals} onAddGoal={async (g) => { await transactionService.addGoal(session.user.id, g); loadAllData(session.user.id); }} onUpdateGoal={async (id, a) => { await transactionService.updateGoalAmount(session.user.id, id, a); loadAllData(session.user.id); }} />}
                    {activeView === 'education' && <EducationView transactions={transactions} />}
                    {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={loadAllData} />}
                 </div>
             </div>
        </main>

        <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-2 z-40 flex justify-between items-center border border-slate-200/50">
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
                    className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${item.main ? 'bg-brand-600 text-white shadow-lg -mt-10 w-16 h-16 rounded-[2rem] active:scale-95 border-4 border-surface' : activeView === item.id ? 'text-brand-600 bg-brand-50' : 'text-slate-400'}`}
                 >
                     <item.icon size={item.main ? 32 : 24} strokeWidth={item.main ? 3 : 2} />
                 </button>
             ))}
        </nav>
    </div>
  );
}

export default App;
