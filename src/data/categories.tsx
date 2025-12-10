import React from 'react';
import { Utensils, Home, Car, Tv, HeartPulse, ShoppingBag, GraduationCap, Zap, CreditCard, Wallet } from 'lucide-react';
import { Category } from '../types';

export const CATEGORY_CONFIG: Record<Category, { icon: React.ElementType, style: string }> = {
    [Category.FOOD]: { icon: Utensils, style: 'bg-orange-100 text-orange-600' },
    [Category.HOUSING]: { icon: Home, style: 'bg-blue-100 text-blue-600' },
    [Category.TRANSPORT]: { icon: Car, style: 'bg-yellow-100 text-yellow-600' },
    [Category.ENTERTAINMENT]: { icon: Tv, style: 'bg-purple-100 text-purple-600' },
    [Category.HEALTH]: { icon: HeartPulse, style: 'bg-rose-100 text-rose-600' },
    [Category.SHOPPING]: { icon: ShoppingBag, style: 'bg-pink-100 text-pink-600' },
    [Category.EDUCATION]: { icon: GraduationCap, style: 'bg-indigo-100 text-indigo-600' },
    [Category.SERVICES]: { icon: Zap, style: 'bg-cyan-100 text-cyan-600' },
    [Category.DEBT]: { icon: CreditCard, style: 'bg-slate-200 text-slate-600' },
    [Category.OTHER]: { icon: Wallet, style: 'bg-slate-100 text-slate-500' },
    [Category.FIXED_INCOME]: { icon: Wallet, style: 'bg-brand-100 text-brand-600' },
    [Category.VARIABLE_INCOME]: { icon: Wallet, style: 'bg-emerald-100 text-emerald-600' },
    [Category.TRANSFER_OUT]: { icon: Wallet, style: 'bg-slate-100 text-slate-400' },
    [Category.TRANSFER_IN]: { icon: Wallet, style: 'bg-slate-100 text-slate-400' },
};

export const getCategoryIcon = (category: Category) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG[Category.OTHER];
    const Icon = config.icon;
    return <Icon size={20} />;
};

export const getCategoryStyle = (category: Category) => {
    return CATEGORY_CONFIG[category]?.style || CATEGORY_CONFIG[Category.OTHER].style;
};