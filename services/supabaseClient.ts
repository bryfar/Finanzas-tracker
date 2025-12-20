
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bihxxhbniecozyepsvux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaHh4aGJuaWVjb3p5ZXBzdnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzg4NTAsImV4cCI6MjA4MDgxNDg1MH0.ipiJdJbYJpI9pfyT95iqx6ve8tCrM2cUD2MqHZD5-cg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'finanzas-ai' }
  }
});

// Test de conectividad silencioso
supabase.auth.getSession().catch(err => console.warn("Supabase auth check failed:", err));
