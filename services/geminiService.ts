
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIInsight, EducationTip, AIPersonality, Snap, Goal } from "../types";

// Use gemini-3-flash-preview for general tasks
const modelId = "gemini-3-flash-preview";

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  contextData: Transaction[],
  streak: number,
  personality: AIPersonality = 'MOTIVATOR'
): Promise<string> => {
  try {
    // Initializing right before use as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const dataContext = JSON.stringify(contextData.slice(0, 30));
    
    let toneInstruction = "Profesional pero motivador.";
    if (personality === 'STRICT') toneInstruction = "Directo, sin rodeos, enfocado en la disciplina y el ahorro extremo.";
    if (personality === 'SARCASTIC') toneInstruction = "Con humor ácido, sarcástico pero dando buenos consejos financieros.";

    const systemInstruction = `
      Eres FinanzasAI, un Asesor Financiero experto.
      
      PERSONALIDAD SELECCIONADA: ${toneInstruction}
      
      ESTRATEGIA RECOMENDADA: Regla 50/20/30.
      - 50% para Esenciales (Vivienda, Servicios, Transporte, Alimentación, Salud, Deudas).
      - 20% para Estilo de Vida (Entretenimiento, Compras, Otros).
      - 30% para Futuro / Categoría Millonaria (Fondo de emergencia, Plazo fijo, Inversión a largo plazo).
      
      CONTEXTO DEL USUARIO:
      - Racha de uso: ${streak} días.
      - Transacciones recientes: ${dataContext}.
      
      OBJETIVO:
      Proporciona consejos financieros personalizados basados en los datos. Enfócate especialmente en ayudar al usuario a cumplir la regla 50/20/30. Usa Markdown para dar formato.
    `;

    const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction },
        history: chatHistory
    });

    const response = await chat.sendMessage({
      message: currentMessage
    });

    return response.text || "Lo siento, no pude procesar esa consulta.";
  } catch (error) {
    console.error("Gemini Chat error:", error);
    return "Tuve un pequeño problema técnico analizando tus finanzas. ¿Podrías intentar de nuevo?";
  }
};

export const detectAnomalies = (transactions: Transaction[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    if (expenses.length > 5) {
        const avg = expenses.reduce((s, t) => s + t.amount, 0) / expenses.length;
        const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();
        const highExpenses = expenses.filter(t => t.amount > avg * 2 && t.date > lastWeek);
        
        highExpenses.forEach(t => {
            insights.push({
                id: t.id,
                type: 'ANOMALY',
                message: `Detecté un gasto inusual de S/.${t.amount} en ${t.category}. ¿Es correcto?`,
                date: t.date
            });
        });

        const coffeeShops = expenses.filter(t => t.category === 'Alimentación' && t.amount < 20).length;
        if (coffeeShops > 5) {
             insights.push({
                id: 'ant-1',
                type: 'WARNING',
                message: `Has realizado varios gastos pequeños en alimentación. ¡Cuidado con los gastos hormiga!`,
                date: new Date().toISOString()
            });
        }
    }
    return insights;
};

export const generateEducationTips = (transactions: Transaction[]): EducationTip[] => {
    const tips: EducationTip[] = [
        { id: '1', title: 'Regla 50/20/30', content: 'Divide tus ingresos: 50% necesidades, 20% deseos, 30% categoría millonaria (emergencia, plazos fijos e inversión).', category: 'Estrategia', readTime: '2 min' },
        { id: '2', title: 'Fondo de Emergencia', content: 'Tu prioridad en el 30% del futuro. Debe cubrir de 3 a 6 meses de tus gastos fijos.', category: 'Ahorro', readTime: '1 min' },
        { id: '3', title: 'Inversión vs Ahorro', content: 'Ahorrar es guardar, invertir es poner a trabajar. Tu 30% debe buscar rentabilidad.', category: 'Inversión', readTime: '3 min' },
    ];
    
    return tips;
};

export const generateDailySnaps = (goals: Goal[], streak: number): Snap[] => {
    const snaps: Snap[] = [];

    snaps.push({
        id: 'streak-intro',
        type: 'STREAK_SUMMARY',
        content: {
            title: `¡${streak} Días de Racha!`,
            subtitle: 'Tu disciplina financiera está dando frutos. Sigue así.',
            mediaUrl: 'https://images.unsplash.com/photo-1550534791-2677533605ab?q=80&w=1000&auto=format&fit=crop'
        }
    });

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    activeGoals.slice(0, 2).forEach(goal => {
        snaps.push({
            id: `promo-${goal.id}`,
            type: 'GOAL_PROMO',
            content: {
                title: goal.name,
                subtitle: `Estás al ${((goal.currentAmount/goal.targetAmount)*100).toFixed(0)}% de tu meta. ¡Un esfuerzo más!`,
                mediaUrl: goal.mediaUrl || `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop`,
                goalId: goal.id,
                actionLabel: 'Ahorro Rápido'
            }
        });
    });

    return snaps;
};
