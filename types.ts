export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
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
  // Categorías internas para ingresos (aunque no se muestren en UI)
  FIXED_INCOME = 'Ingreso Fijo',
  VARIABLE_INCOME = 'Ingreso Variable'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  isFixed: boolean; // Nuevo: Determina si es Fijo o Variable
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  fixedExpenses: number;
  variableExpenses: number;
}

// Estructuras para la IA
export interface AIAdvice {
  title: string;
  description: string;
  impact: 'ALTO' | 'MEDIO' | 'BAJO';
  actionable: boolean;
}

export interface AIFinancialAnalysis {
  healthScore: number; // 0 a 100
  summary: string;
  forecast: string;
  tips: AIAdvice[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}