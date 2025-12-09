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

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  mediaUrl?: string; // New: Image for Stories
  allowQuickSave?: boolean; // New: Toggle for appearing in feed
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

// AI & New Features
export interface Asset {
  id: string;
  name: string;
  value: number;
  type: 'ASSET' | 'LIABILITY'; 
  category: 'REAL_ESTATE' | 'VEHICLE' | 'INVESTMENT' | 'DEBT' | 'OTHER';
}

export type AIPersonality = 'STRICT' | 'MOTIVATOR' | 'SARCASTIC';
export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'RISKY';

export interface AIConfig {
  personality: AIPersonality;
  riskProfile: RiskProfile;
}

export interface UserMetadata {
  full_name?: string;
  bio?: string;
  avatar_seed?: string;
  quick_save_amount?: number; // New: Default double tap amount
}

export interface EducationTip {
  id: string;
  title: string;
  content: string;
  category: string;
  readTime: string; 
}

export interface AIInsight {
  id: string;
  type: 'ANOMALY' | 'TIP' | 'WARNING';
  message: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Finny Snaps (TikTok Mode)
export interface Snap {
  id: string;
  type: 'GOAL_PROMO' | 'TIP' | 'QUIZ' | 'STREAK_SUMMARY';
  content: {
    title: string;
    subtitle: string;
    mediaUrl?: string; // Background Image/Video
    goalId?: string; // If it's a quick save snap
    actionLabel?: string;
  };
}