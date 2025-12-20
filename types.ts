
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum Category {
  FOOD = 'Alimentación',
  HOUSING = 'Vivienda',
  TRANSPORT = 'Transporte',
  ENTERTAINMENT = 'Entretenimiento',
  HEALTH = 'Salud',
  SHOPPING = 'Compras',
  EDUCATION = 'Educación',
  SERVICES = 'Servicios',
  DEBT = 'Deudas',
  OTHER = 'Otros',
  FIXED_INCOME = 'Ingreso Fijo',
  VARIABLE_INCOME = 'Ingreso Variable',
  TRANSFER_OUT = 'Transferencia Enviada',
  TRANSFER_IN = 'Transferencia Recibida'
}

export interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT' | 'INVESTMENT';
  balance: number;
  color: string;
  icon?: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: 'EMERGENCY_FUND' | 'FIXED_TERM' | 'STOCKS' | 'CRYPTO' | 'SAVINGS';
  amount: number;
  interestRate: number; // Tasa Anual
  institution: string;
  startDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  mediaUrl?: string; 
  allowQuickSave?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  nextPaymentDate: string;
  category: Category;
  logoUrl?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  isFixed: boolean;
  accountId?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  fixedExpenses: number;
  variableExpenses: number;
  projectedBalance: number;
}

export interface StrategyBucket {
  id: 'ESSENTIALS' | 'LIFESTYLE' | 'FUTURE';
  label: string;
  percentage: number;
  current: number;
  target: number;
  color: string;
  categories: Category[];
}

export type AIPersonality = 'STRICT' | 'MOTIVATOR' | 'SARCASTIC';
export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'RISKY';

export interface UserMetadata {
  full_name?: string;
  bio?: string;
  avatar_seed?: string;
  quick_save_amount?: number;
}

// Fixed: Added missing EducationTip interface for education view and AI service
export interface EducationTip {
  id: string;
  title: string;
  content: string;
  category: string;
  readTime: string; 
}

// Fixed: Added missing AIInsight interface for anomaly detection
export interface AIInsight {
  id: string;
  type: 'ANOMALY' | 'TIP' | 'WARNING';
  message: string;
  date: string;
}

// Fixed: Added missing ChatMessage interface for the AI Advisor chat UI
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Snap {
  id: string;
  type: 'GOAL_PROMO' | 'TIP' | 'QUIZ' | 'STREAK_SUMMARY';
  content: {
    title: string;
    subtitle: string;
    mediaUrl?: string;
    goalId?: string;
    actionLabel?: string;
  };
}
