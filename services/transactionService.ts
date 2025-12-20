
import { supabase } from './supabaseClient';
import { Transaction, TransactionType, Category, Account, Goal, Subscription, Investment, RecurringTransaction } from '../types';

const LOCAL_STORAGE_KEY_PREFIX = 'finanzas_ai_v4_';

const getLocal = <T>(userId: string, key: string): T[] => {
  try {
    const data = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

const saveLocal = (userId: string, key: string, data: any[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}_${key}`, JSON.stringify(data));
};

// Mappings...
const mapTxFromDb = (item: any): Transaction => ({
  id: item.id,
  date: item.date,
  amount: Number(item.amount),
  type: item.type as TransactionType,
  category: item.category as Category,
  description: item.description || '',
  isFixed: !!item.is_fixed,
  accountId: item.account_id
});

const mapRecurringFromDb = (item: any): RecurringTransaction => ({
  id: item.id,
  name: item.name,
  amount: Number(item.amount),
  type: item.type as TransactionType,
  category: item.category as Category,
  dayOfMonth: Number(item.day_of_month),
  isAuto: !!item.is_auto,
  accountId: item.account_id,
  lastProcessedMonth: item.last_processed_month
});

// Added missing mapping for investments
const mapInvestmentFromDb = (item: any): Investment => ({
  id: item.id,
  userId: item.user_id,
  name: item.name,
  type: item.type,
  amount: Number(item.amount),
  interestRate: Number(item.interest_rate),
  institution: item.institution || 'Otras',
  startDate: item.start_date
});

export const transactionService = {
  // --- RECURRING TRANSACTIONS ---
  async getRecurring(userId: string): Promise<RecurringTransaction[]> {
    try {
      const { data, error } = await supabase.from('recurring_transactions').select('*').eq('user_id', userId);
      if (error) throw error;
      const mapped = (data || []).map(mapRecurringFromDb);
      saveLocal(userId, 'recurring', mapped);
      return mapped;
    } catch (e) { return getLocal<RecurringTransaction>(userId, 'recurring'); }
  },

  async addRecurring(userId: string, rec: Omit<RecurringTransaction, 'id'>) {
    try {
      const { data, error } = await supabase.from('recurring_transactions').insert([{
        name: rec.name,
        amount: rec.amount,
        type: rec.type,
        category: rec.category,
        day_of_month: rec.dayOfMonth,
        is_auto: rec.isAuto,
        account_id: rec.accountId,
        user_id: userId
      }]).select().single();
      if (error) throw error;
      return mapRecurringFromDb(data);
    } catch (e) {
      const newRec = { ...rec, id: crypto.randomUUID() };
      return newRec as RecurringTransaction;
    }
  },

  async markRecurringProcessed(userId: string, id: string, monthStr: string) {
    try {
      await supabase.from('recurring_transactions').update({ last_processed_month: monthStr }).eq('id', id);
    } catch (e) {}
  },

  async deleteRecurring(userId: string, id: string) {
      await supabase.from('recurring_transactions').delete().eq('id', id);
  },

  // --- TRANSACTIONS ---
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(mapTxFromDb);
      saveLocal(userId, 'transactions', mapped);
      return mapped;
    } catch (error) { return getLocal<Transaction>(userId, 'transactions'); }
  },

  // Fixed: Added checkPossibleDuplicate method to fix Error in TransactionForm.tsx
  async checkPossibleDuplicate(userId: string, amount: number, description: string): Promise<boolean> {
      const recent = await this.getAll(userId);
      const now = new Date().toISOString().split('T')[0];
      const duplicate = recent.find(t => 
          t.amount === amount && 
          t.description.toLowerCase() === description.toLowerCase() && 
          t.date === now
      );
      return !!duplicate;
  },

  async add(userId: string, transaction: Omit<Transaction, 'id'>) {
    try {
      const { data, error } = await supabase.from('transactions').insert([{ 
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        is_fixed: transaction.isFixed,
        account_id: transaction.accountId,
        user_id: userId 
      }]).select().single();
      if (error) throw error;
      const newTx = mapTxFromDb(data);
      if (transaction.accountId) await this.updateAccountBalance(userId, transaction.accountId, transaction.amount, transaction.type);
      return newTx;
    } catch (error) {
      const newTx: Transaction = { ...transaction, id: crypto.randomUUID() };
      if (transaction.accountId) await this.updateAccountBalance(userId, transaction.accountId, transaction.amount, transaction.type);
      return newTx;
    }
  },

  async delete(userId: string, id: string) {
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
  },

  // --- ACCOUNTS ---
  async getAccounts(userId: string) {
    try {
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId).order('name');
      if (error) throw error;
      const mapped = (data || []).map(mapAccountFromDb);
      saveLocal(userId, 'accounts', mapped);
      return mapped;
    } catch (error) { return getLocal<Account>(userId, 'accounts'); }
  },

  async addAccount(userId: string, account: Omit<Account, 'id'>) {
      const { data, error } = await supabase.from('accounts').insert([{ ...account, user_id: userId }]).select().single();
      return error ? { ...account, id: crypto.randomUUID() } : mapAccountFromDb(data);
  },

  async updateAccountBalance(userId: string, accountId: string, amount: number, type: TransactionType) {
    const accs = await this.getAccounts(userId);
    const acc = accs.find(a => a.id === accountId);
    if (acc) {
      const adjustment = type === TransactionType.INCOME ? amount : -amount;
      const newBalance = acc.balance + adjustment;
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
    }
  },

  async transfer(userId: string, fromId: string, toId: string, amount: number) {
    await this.add(userId, { date: new Date().toISOString().split('T')[0], amount, type: TransactionType.EXPENSE, category: Category.OTHER, description: 'Transferencia (Salida)', isFixed: false, accountId: fromId });
    await this.add(userId, { date: new Date().toISOString().split('T')[0], amount, type: TransactionType.INCOME, category: Category.OTHER, description: 'Transferencia (Entrada)', isFixed: false, accountId: toId });
  },

  // --- GOALS, SUBS, ETC ---
  async getGoals(userId: string) {
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId);
    return (data || []).map(mapGoalFromDb);
  },

  async addGoal(userId: string, goal: Omit<Goal, 'id'>) {
      const { data } = await supabase.from('goals').insert([{ ...goal, user_id: userId }]).select().single();
      return mapGoalFromDb(data);
  },

  async updateGoalAmount(userId: string, goalId: string, newAmount: number) {
      await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goalId);
  },

  async getSubscriptions(userId: string) {
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId);
    return (data || []).map(mapSubFromDb);
  },

  async addSubscription(userId: string, sub: Omit<Subscription, 'id'>) {
      const { data } = await supabase.from('subscriptions').insert([{ ...sub, user_id: userId }]).select().single();
      return mapSubFromDb(data);
  },

  async quickSave(userId: string, goalId: string, amount: number) {
    const accs = await this.getAccounts(userId);
    const bank = accs.find(a => a.type === 'BANK') || accs[0];
    if (bank) {
        await this.add(userId, { amount, type: TransactionType.EXPENSE, category: Category.OTHER, description: '#QuickSave', date: new Date().toISOString().split('T')[0], isFixed: false, accountId: bank.id });
        const goals = await this.getGoals(userId);
        const goal = goals.find(g => g.id === goalId);
        if (goal) await this.updateGoalAmount(userId, goalId, goal.currentAmount + amount);
    }
  },

  // --- INVESTMENTS ---
  // Fixed: Added getInvestments, addInvestment, and deleteInvestment methods
  async getInvestments(userId: string): Promise<Investment[]> {
      try {
          const { data, error } = await supabase.from('investments').select('*').eq('user_id', userId);
          if (error) throw error;
          const mapped = (data || []).map(mapInvestmentFromDb);
          saveLocal(userId, 'investments', mapped);
          return mapped;
      } catch (e) { return getLocal<Investment>(userId, 'investments'); }
  },

  async addInvestment(userId: string, inv: Omit<Investment, 'id' | 'userId'>) {
      try {
          const { data, error } = await supabase.from('investments').insert([{ 
              name: inv.name,
              type: inv.type,
              amount: inv.amount,
              interest_rate: inv.interestRate,
              institution: inv.institution,
              start_date: inv.startDate,
              user_id: userId 
          }]).select().single();
          if (error) throw error;
          return mapInvestmentFromDb(data);
      } catch (e) {
          const newInv = { ...inv, id: crypto.randomUUID(), userId } as Investment;
          return newInv;
      }
  },

  async deleteInvestment(userId: string, id: string) {
      try {
          await supabase.from('investments').delete().eq('id', id).eq('user_id', userId);
      } catch (e) {}
  }
};

const mapAccountFromDb = (item: any): Account => ({
  id: item.id,
  name: item.name,
  type: item.type,
  balance: Number(item.balance),
  color: item.color,
  icon: item.icon
});

const mapGoalFromDb = (item: any): Goal => ({
  id: item.id,
  name: item.name,
  targetAmount: Number(item.target_amount),
  currentAmount: Number(item.current_amount),
  deadline: item.deadline,
  color: item.color,
  icon: item.icon,
  mediaUrl: item.media_url
});

const mapSubFromDb = (item: any): Subscription => ({
  id: item.id,
  name: item.name,
  amount: Number(item.amount),
  billingCycle: item.billing_cycle,
  nextPaymentDate: item.next_payment_date,
  category: item.category as Category,
  logoUrl: item.logo_url
});
