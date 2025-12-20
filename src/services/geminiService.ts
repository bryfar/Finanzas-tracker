
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIInsight, EducationTip, AIPersonality, Snap, Goal } from "../types";

// Initialize the Google GenAI SDK with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Use gemini-3-flash-preview for basic text tasks
const modelId = "gemini-3-flash-preview";

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  contextData: Transaction[],
  streak: number,
  personality: AIPersonality = 'MOTIVATOR'
): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "Error de configuración: Falta API Key.";

    const dataContext = JSON.stringify(contextData.slice(0, 30));
    
    let toneInstruction = "Profesional pero motivador.";
    if (personality === 'STRICT') toneInstruction = "Directo, sin rodeos, enfocado en la disciplina y el ahorro extremo.";
    if (personality === 'SARCASTIC') toneInstruction = "Con humor ácido, sarcástico pero dando buenos consejos financieros.";

    const systemInstruction = `
      Eres FinanzasAI, un Asesor Financiero.
      
      PERSONALIDAD SELECCIONADA: ${toneInstruction}
      
      CONTEXTO:
      - Racha: ${streak} días.
      - Datos recientes: ${dataContext}.
      
      OBJETIVO:
      Responde a la consulta. Usa Markdown.
    `;

    const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    // Create a chat session with system instruction
    const chatWithHistory = ai.chats.create({
        model: modelId,
        config: { systemInstruction },
        history: chatHistory
    });

    // Send the message and get the response
    const response = await chatWithHistory.sendMessage({
      message: currentMessage
    });

    // Extract text output using the .text property
    return response.text || "No pude procesar tu respuesta.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Mi cerebro financiero está en mantenimiento. Intenta de nuevo.";
  }
};

export const detectAnomalies = (transactions: Transaction[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    if (expenses.length > 5) {
        const avg = expenses.reduce((s, t) => s + t.amount, 0) / expenses.length;
        const highExpenses = expenses.filter(t => t.amount > avg * 2 && t.date > new Date(Date.now() - 7 * 86400000).toISOString());
        
        highExpenses.forEach(t => {
            insights.push({
                id: t.id,
                type: 'ANOMALY',
                message: `Detecté un gasto inusual de S/.${t.amount} en ${t.category}. ¿Todo bien?`,
                date: t.date
            });
        });

        const coffeeShops = expenses.filter(t => t.category === 'Alimentación' && t.amount < 20).length;
        if (coffeeShops > 5) {
             insights.push({
                id: 'ant-1',
                type: 'WARNING',
                message: `Has hecho ${coffeeShops} gastos pequeños en comida. Los "gastos hormiga" suman.`,
                date: new Date().toISOString()
            });
        }
    }
    return insights;
};

export const generateEducationTips = (transactions: Transaction[]): EducationTip[] => {
    const tips: EducationTip[] = [
        { id: '1', title: 'Regla 50/30/20', content: 'Divide tus ingresos: 50% necesidades, 30% deseos, 20% ahorros.', category: 'Presupuesto', readTime: '2 min' },
        { id: '2', title: 'Fondo de Emergencia', content: 'Deberías tener de 3 a 6 meses de gastos fijos ahorrados.', category: 'Ahorro', readTime: '1 min' },
        { id: '3', title: 'Interés Compuesto', content: 'Es el interés sobre el interés. Tu mejor amigo a largo plazo.', category: 'Inversión', readTime: '3 min' },
    ];
    
    const transportSpend = transactions.filter(t => t.category === 'Transporte').length;
    if (transportSpend > 3) {
        tips.unshift({
            id: 'car-1', title: 'Ahorra en Gasolina', content: 'Mantén tus llantas infladas y evita acelerones bruscos para ahorrar hasta 15%.', category: 'Transporte', readTime: '1 min'
        });
    }

    return tips;
};

export const generateDailySnaps = (goals: Goal[], streak: number): Snap[] => {
    const snaps: Snap[] = [];

    snaps.push({
        id: 'streak-intro',
        type: 'STREAK_SUMMARY',
        content: {
            title: `¡${streak} Días en Racha!`,
            subtitle: 'Mantén el fuego encendido. Hoy es un buen día para ahorrar.',
            mediaUrl: 'https://images.unsplash.com/photo-1550534791-2677533605ab?q=80&w=1000&auto=format&fit=crop'
        }
    });

    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    
    activeGoals.slice(0, 3).forEach(goal => {
        snaps.push({
            id: `promo-${goal.id}`,
            type: 'GOAL_PROMO',
            content: {
                title: goal.name,
                subtitle: `Te faltan S/. ${(goal.targetAmount - goal.currentAmount).toLocaleString()} para completarlo.`,
                mediaUrl: goal.mediaUrl || `https://source.unsplash.com/random/800x1600/?${goal.name.split(' ')[0]},travel,money`,
                goalId: goal.id,
                actionLabel: 'Doble Tap para Ahorrar'
            }
        });
    });

    snaps.push({
        id: 'tip-daily',
        type: 'TIP',
        content: {
            title: 'Sabías que...',
            subtitle: 'Si ahorras S/. 5 al día, al final del año tendrás S/. 1,825 para tus vacaciones.',
            mediaUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop'
        }
    });

    return snaps;
};
