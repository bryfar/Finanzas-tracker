import { supabase } from './supabaseClient';
import { Transaction, TransactionType, Category } from '../types';

const LOCAL_STORAGE_KEY = 'finanzas_ai_local_data';

// Mapeo de datos para convertir snake_case (DB) a camelCase (App)
const mapFromDb = (item: any): Transaction => ({
  id: item.id,
  date: item.date,
  amount: Number(item.amount),
  type: item.type as TransactionType,
  category: item.category as Category,
  description: item.description || '',
  isFixed: !!item.is_fixed
});

// Helper para obtener datos locales
const getLocalData = (): Transaction[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// Helper para guardar datos locales
const saveLocalData = (transactions: Transaction[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
};

export const transactionService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Sincronizar local con remoto si la carga fue exitosa (opcional, estrategia simple)
      const mapped = (data || []).map(mapFromDb);
      saveLocalData(mapped);
      return mapped;

    } catch (error: any) {
      console.warn('Modo Offline activado por error de Supabase:', error.message || error);
      // Fallback a LocalStorage si falla Supabase (ej. Tabla no creada, Sin internet)
      return getLocalData();
    }
  },

  async add(transaction: Omit<Transaction, 'id'>) {
    try {
      // Obtenemos el usuario actual para asegurarnos de que la transacción se asocia a él
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          is_fixed: transaction.isFixed,
          user_id: user?.id // Importante para RLS
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newTx = mapFromDb(data);
      
      // Actualizar backup local
      const current = getLocalData();
      saveLocalData([newTx, ...current]);
      
      return newTx;

    } catch (error: any) {
      console.warn('Guardando en modo Offline:', error.message || error);
      
      // Generar ID temporal y guardar localmente
      const newTx: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
      };
      
      const current = getLocalData();
      saveLocalData([newTx, ...current]);
      
      return newTx;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Actualizar backup local
      const current = getLocalData();
      saveLocalData(current.filter(t => t.id !== id));

    } catch (error: any) {
      console.warn('Eliminando en modo Offline:', error.message || error);
      
      // Eliminar localmente
      const current = getLocalData();
      saveLocalData(current.filter(t => t.id !== id));
    }
  }
};