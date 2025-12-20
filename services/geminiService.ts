
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIInsight, EducationTip, AIPersonality, Snap, Goal } from "../types";

// We define a helper to get a fresh instance of the AI client using the current environment key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-3-flash-preview";

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  contextData: Transaction[],
  streak: number,
  personality: AIPersonality = 'MOTIVATOR'
): Promise<string> => {
  try {
    const ai = getAI();
    const dataContext = JSON.stringify(contextData.slice(0, 30));
    
    let toneInstruction = "Profesional pero motivador.";
    if (personality === 'STRICT') toneInstruction = "Directo, sin rodeos, enfocado en la disciplina y el ahorro extremo.";
    if (personality === 'SARCASTIC') toneInstruction = "Con humor ácido, sarcástico pero dando buenos consejos financieros.";

    const systemInstruction = `
      Eres FinanzasAI, un Asesor Financiero experto.
      
      PERSONALIDAD SELECCIONADA: ${toneInstruction}
      
      CONTEXTO DEL USUARIO:
      - Racha de uso: ${streak} días.
      - Transacciones recientes: ${dataContext}.
      
      OBJETIVO:
      Proporciona consejos financieros personalizados basados en los datos. Usa Markdown para dar formato.
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

    // Directly access .text property
    return response.text || "Lo siento, no pude procesar esa consulta.";
  } catch (error) {
    console.error("Chat error:", error);
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
        { id: '1', title: 'Regla 50/30/20', content: 'Divide tus ingresos: 50% necesidades, 30% deseos, 20% ahorros e inversión.', category: 'Presupuesto', readTime: '2 min' },
        { id: '2', title: 'Fondo de Emergencia', content: 'Lo ideal es tener de 3 a 6 meses de tus gastos fijos cubiertos para imprevistos.', category: 'Ahorro', readTime: '1 min' },
        { id: '3', title: 'El Interés Compuesto', content: 'Es la fuerza más poderosa del universo financiero. Empieza a invertir hoy mismo.', category: 'Inversión', readTime: '3 min' },
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
                mediaUrl: goal.mediaUrl || `https://source.unsplash.com/random/800x1600/?savings,money`,
                goalId: goal.id,
                actionLabel: 'Ahorro Rápido'
            }
        });
    });

    return snaps;
};
