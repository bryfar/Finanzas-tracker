
import { supabase } from './supabaseClient';
import { Transaction, TransactionType, Category, Account, Goal, Subscription, Investment } from '../types';

const LOCAL_STORAGE_KEY_PREFIX = 'finanzas_ai_v3_';

const getLocal = <T>(userId: string, key: string): T[] => {
  try {
    const data = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

const saveLocal = (userId: string, key: string, data: any[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}_${key}`, JSON.stringify(data));
};

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

export const transactionService = {
  clearLocalCache(userId: string) {
    const keys = ['transactions', 'accounts', 'goals', 'subscriptions', 'investments'];
    keys.forEach(k => localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}_${k}`));
  },

  // --- INVESTMENTS ---
  async getInvestments(userId: string) {
      try {
          const { data, error } = await supabase
              .from('investments')
              .select('*')
              .eq('user_id', userId);
          if (error) throw error;
          const mapped = (data || []).map(mapInvestmentFromDb);
          saveLocal(userId, 'investments', mapped);
          return mapped;
      } catch (e) {
          return getLocal<Investment>(userId, 'investments');
      }
  },

  async addInvestment(userId: string, inv: Omit<Investment, 'id' | 'userId'>) {
      try {
          const { data, error } = await supabase
              .from('investments')
              .insert([{
                  name: inv.name,
                  type: inv.type,
                  amount: inv.amount,
                  interest_rate: inv.interestRate,
                  institution: inv.institution,
                  start_date: inv.startDate,
                  user_id: userId
              }])
              .select().single();
          if (error) throw error;
          const newInv = mapInvestmentFromDb(data);
          const current = getLocal<Investment>(userId, 'investments');
          saveLocal(userId, 'investments', [...current, newInv]);
          return newInv;
      } catch (e) {
          const newInv = { ...inv, id: crypto.randomUUID(), userId } as Investment;
          const current = getLocal<Investment>(userId, 'investments');
          saveLocal(userId, 'investments', [...current, newInv]);
          return newInv;
      }
  },

  async deleteInvestment(userId: string, id: string) {
    await supabase.from('investments').delete().eq('id', id).eq('user_id', userId);
    const current = getLocal<Investment>(userId, 'investments');
    saveLocal(userId, 'investments', current.filter(i => i.id !== id));
  },

  // --- TRANSACTIONS ---
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId) 
        .order('date', { ascending: false });
      
      if (error) throw error;
      const mapped = (data || []).map(mapTxFromDb);
      saveLocal(userId, 'transactions', mapped);
      return mapped;
    } catch (error) {
      return getLocal<Transaction>(userId, 'transactions');
    }
  },

  // Fixed: Added checkPossibleDuplicate method to help UI detect potential double entries
  async checkPossibleDuplicate(userId: string, amount: number, description: string): Promise<boolean> {
      const recent = await this.getAll(userId);
      const now = new Date();
      
      const duplicate = recent.find(t => {
          return t.amount === amount && 
                 t.description.toLowerCase() === description.toLowerCase() &&
                 t.date === now.toISOString().split('T')[0];
      });

      return !!duplicate;
  },

  async add(userId: string, transaction: Omit<Transaction, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          is_fixed: transaction.isFixed,
          account_id: transaction.accountId,
          user_id: userId
        }])
        .select().single();

      if (error) throw error;
      const newTx = mapTxFromDb(data);

      if (transaction.accountId) {
        await this.updateAccountBalance(userId, transaction.accountId, transaction.amount, transaction.type);
      }

      const current = getLocal<Transaction>(userId, 'transactions');
      saveLocal(userId, 'transactions', [newTx, ...current]);
      return newTx;
    } catch (error) {
      const newTx: Transaction = { ...transaction, id: crypto.randomUUID() };
      const current = getLocal<Transaction>(userId, 'transactions');
      saveLocal(userId, 'transactions', [newTx, ...current]);
      return newTx;
    }
  },

  async delete(userId: string, id: string) {
    try {
      await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
      const current = getLocal<Transaction>(userId, 'transactions');
      saveLocal(userId, 'transactions', current.filter(t => t.id !== id));
    } catch (error) {
      const current = getLocal<Transaction>(userId, 'transactions');
      saveLocal(userId, 'transactions', current.filter(t => t.id !== id));
    }
  },

  // --- ACCOUNTS ---
  async getAccounts(userId: string) {
    try {
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId).order('name');
      if (error) throw error;
      const mapped = (data || []).map(mapAccountFromDb);
      saveLocal(userId, 'accounts', mapped);
      return mapped;
    } catch (error) {
      return getLocal<Account>(userId, 'accounts');
    }
  },

  async addAccount(userId: string, account: Omit<Account, 'id'>) {
    try {
      const { data, error } = await supabase.from('accounts').insert([{ ...account, user_id: userId }]).select().single();
      if (error) throw error;
      const newAcc = mapAccountFromDb(data);
      const current = getLocal<Account>(userId, 'accounts');
      saveLocal(userId, 'accounts', [...current, newAcc]);
      return newAcc;
    } catch (error) {
      const newAcc = { ...account, id: crypto.randomUUID() };
      const current = getLocal<Account>(userId, 'accounts');
      saveLocal(userId, 'accounts', [...current, newAcc]);
      return newAcc;
    }
  },

  async updateAccountBalance(userId: string, accountId: string, amount: number, type: TransactionType) {
    const adjustment = type === TransactionType.INCOME ? amount : -amount;
    const accounts = getLocal<Account>(userId, 'accounts');
    const acc = accounts.find(a => a.id === accountId);
    
    if (acc) {
        const newBalance = acc.balance + adjustment;
        try {
            await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId).eq('user_id', userId);
        } catch (e) {}
        const updatedAccounts = accounts.map(a => a.id === accountId ? { ...a, balance: newBalance } : a);
        saveLocal(userId, 'accounts', updatedAccounts);
    }
  },

  async transfer(userId: string, fromId: string, toId: string, amount: number) {
     await this.add(userId, {
         date: new Date().toISOString().split('T')[0],
         amount: amount,
         type: TransactionType.EXPENSE,
         category: Category.TRANSFER_OUT,
         description: 'Transferencia Enviada',
         isFixed: false,
         accountId: fromId
     });
     
     await this.add(userId, {
         date: new Date().toISOString().split('T')[0],
         amount: amount,
         type: TransactionType.INCOME, 
         category: Category.TRANSFER_IN,
         description: 'Transferencia Recibida',
         isFixed: false,
         accountId: toId
     });
  },

  // --- GOALS ---
  async getGoals(userId: string) {
    try {
      const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId);
      if (error) throw error;
      const mapped = (data || []).map(mapGoalFromDb);
      saveLocal(userId, 'goals', mapped);
      return mapped;
    } catch (error) { return getLocal<Goal>(userId, 'goals'); }
  },

  async addGoal(userId: string, goal: Omit<Goal, 'id'>) {
    try {
        const payload = {
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            deadline: goal.deadline,
            color: goal.color,
            icon: goal.icon,
            user_id: userId,
            media_url: goal.mediaUrl 
        };
        const { data, error } = await supabase.from('goals').insert([payload]).select().single();
        if (error) throw error;
        const newGoal = mapGoalFromDb(data);
        const current = getLocal<Goal>(userId, 'goals');
        saveLocal(userId, 'goals', [...current, newGoal]);
        return newGoal;
    } catch (error) {
        const newGoal = { ...goal, id: crypto.randomUUID() };
        const current = getLocal<Goal>(userId, 'goals');
        saveLocal(userId, 'goals', [...current, newGoal]);
        return newGoal;
    }
  },

  async updateGoalAmount(userId: string, goalId: string, newAmount: number) {
      try {
          await supabase.from('goals').update({ current_amount: newAmount }).eq('id', goalId).eq('user_id', userId);
          const goals = getLocal<Goal>(userId, 'goals');
          const updated = goals.map(g => g.id === goalId ? { ...g, currentAmount: newAmount } : g);
          saveLocal(userId, 'goals', updated);
      } catch (e) {
          const goals = getLocal<Goal>(userId, 'goals');
          const updated = goals.map(g => g.id === goalId ? { ...g, currentAmount: newAmount } : g);
          saveLocal(userId, 'goals', updated);
      }
  },

  async quickSave(userId: string, goalId: string, amount: number) {
      const accounts = await this.getAccounts(userId);
      const sourceAccount = accounts.find(a => a.type === 'BANK' && a.balance >= amount) || accounts[0];
      if (!sourceAccount) throw new Error("No hay cuentas disponibles");

      const goals = await this.getGoals(userId);
      const targetGoal = goals.find(g => g.id === goalId);
      if (!targetGoal) throw new Error("Meta no encontrada");

      await this.add(userId, {
          date: new Date().toISOString().split('T')[0],
          amount: amount,
          type: TransactionType.EXPENSE,
          category: Category.OTHER, 
          description: `#QuickSave para ${targetGoal.name}`,
          isFixed: false,
          accountId: sourceAccount.id
      });
      await this.updateGoalAmount(userId, goalId, targetGoal.currentAmount + amount);
      return true;
  },

  // --- SUBSCRIPTIONS ---
  async getSubscriptions(userId: string) {
      try {
          const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId);
          if (error) throw error;
          const mapped = (data || []).map(mapSubFromDb);
          saveLocal(userId, 'subscriptions', mapped);
          return mapped;
      } catch (error) { return getLocal<Subscription>(userId, 'subscriptions'); }
  },

  async addSubscription(userId: string, sub: Omit<Subscription, 'id'>) {
      try {
          const payload = {
              name: sub.name,
              amount: sub.amount,
              billing_cycle: sub.billingCycle,
              next_payment_date: sub.nextPaymentDate,
              category: sub.category,
              user_id: userId
          };
          const { data, error } = await supabase.from('subscriptions').insert([payload]).select().single();
          if (error) throw error;
          const newSub = mapSubFromDb(data);
          const current = getLocal<Subscription>(userId, 'subscriptions');
          saveLocal(userId, 'subscriptions', [...current, newSub]);
          return newSub;
      } catch (error) {
          const newSub = { ...sub, id: crypto.randomUUID() };
          const current = getLocal<Subscription>(userId, 'subscriptions');
          saveLocal(userId, 'subscriptions', [...current, newSub]);
          return newSub;
      }
  }
};
