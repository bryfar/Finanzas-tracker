
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
      setTransactions(txs); setAccounts(accs); setGoals(gls); setSubscriptions(subs);
      
      const calcStreak = calculateStreak(txs);
      setStreak(calcStreak);
      setDailySnaps(generateDailySnaps(gls, calcStreak));
    } catch (e) { 
        console.error(e);
    } finally { 
        setIsSyncing(false); 
        setIsInitializing(false);
    }
  };

  const handleUpdateProfile = async () => {
      const newSession = await authService.refreshSession();
      setSession(newSession);
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

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
      await transactionService.add(session.user.id, newTx);
      addNotification('success', 'Movimiento guardado');
      loadAllData(session.user.id);
  };

  if (!session && !isInitializing) return <Auth />;
  
  if (isSyncing || isInitializing) return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-surface relative overflow-hidden">
          <Mascot variant="thinking" size={120} className="animate-float mb-6" />
          <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Finanzas AI</h2>
          <p className="text-slate-500 font-medium animate-pulse">Sincronizando tus datos...</p>
      </div>
  );

  const displayName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];

  return (
    <div className="min-h-[100dvh] bg-surface font-sans text-slate-800 flex overflow-hidden">
        <NotificationToast notifications={notifications} removeNotification={(id: string) => setNotifications(p => p.filter(n => n.id !== id))} />
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
            <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100/50 h-full flex flex-col p-6">
                 <div className="flex items-center gap-3 mb-8">
                    <Mascot variant="idle" size={48} />
                    <span className="font-heading font-black text-xl tracking-tight block text-slate-900 leading-none">Finanzas<span className="text-brand-500">AI</span></span>
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
             <div className="p-4 lg:p-8 max-w-[1400px] mx-auto pb-48">
                 {activeView === 'dashboard' && (
                    <div className="space-y-6">
                        <StoriesBar streak={streak} onOpenSnaps={() => setShowSnaps(true)} onAddQuick={() => setShowTxModal(true)} />
                        <AccountsWidget accounts={accounts} onAddAccount={async (a: Omit<Account, 'id'>) => { await transactionService.addAccount(session.user.id, a); loadAllData(session.user.id); }} onTransfer={async (f: string, t: string, amt: number) => { await transactionService.transfer(session.user.id, f, t, amt); loadAllData(session.user.id); }} />
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8 space-y-6">
                                <FinancialChart transactions={transactions} />
                                <TransactionList transactions={transactions} onDelete={async (id: string) => { await transactionService.delete(session.user.id, id); loadAllData(session.user.id); }} />
                            </div>
                            <div className="xl:col-span-4 space-y-6">
                                <SavingsGoal currentSavings={summary.balance} onAdjustBalance={async (val: number) => {
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
                 {activeView === 'goals' && <GoalsSection goals={goals} onAddGoal={async (g: Omit<Goal, 'id'>) => { await transactionService.addGoal(session.user.id, g); loadAllData(session.user.id); }} onUpdateGoal={async (id: string, a: number) => { await transactionService.updateGoalAmount(session.user.id, id, a); loadAllData(session.user.id); }} />}
                 {activeView === 'education' && <EducationView transactions={transactions} />}
                 {activeView === 'settings' && <SettingsView userEmail={session.user.email} userName={displayName} streak={streak} onLogout={() => authService.signOut()} onToggleSound={() => {}} onUpdateName={handleUpdateProfile} />}
             </div>
        </main>
    </div>
  );
}

export default App;
