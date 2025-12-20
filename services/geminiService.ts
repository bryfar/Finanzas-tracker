
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIInsight, EducationTip, AIPersonality, Snap, Goal } from "../types";

// Modelo recomendado para tareas de texto
const modelId = "gemini-3-flash-preview";

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  contextData: Transaction[],
  streak: number,
  personality: AIPersonality = 'MOTIVATOR'
): Promise<string> => {
  try {
    // Inicialización obligatoria dentro de la función para usar la API Key del entorno
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const dataContext = JSON.stringify(contextData.slice(0, 30));
    
    let toneInstruction = "Profesional pero motivador.";
    if (personality === 'STRICT') toneInstruction = "Directo, sin rodeos, enfocado en la disciplina y el ahorro extremo.";
    if (personality === 'SARCASTIC') toneInstruction = "Con humor ácido, sarcástico pero dando buenos consejos financieros.";

    const systemInstruction = `
      Eres FinanzasAI, un Asesor Financiero experto.
      
      PERSONALIDAD SELECCIONADA: ${toneInstruction}
      
      CONTEXTO DEL USUARIO:
      - Racha: ${streak} días.
      - Datos recientes: ${dataContext}.
      
      OBJETIVO:
      Proporciona consejos financieros personalizados. Usa Markdown para dar formato.
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

    return response.text || "No pude procesar la respuesta.";
  } catch (error) {
    console.error("Gemini Chat error:", error);
    return "Lo siento, tuve un problema analizando tus datos. ¿Podemos intentarlo de nuevo?";
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
                message: `Detecté un gasto inusual de S/.${t.amount} en ${t.category}.`,
                date: t.date
            });
        });
    }
    return insights;
};

export const generateEducationTips = (transactions: Transaction[]): EducationTip[] => {
    return [
        { id: '1', title: 'Regla 50/20/30', content: 'Divide tus ingresos: 50% necesidades, 20% deseos, 30% ahorro.', category: 'Estrategia', readTime: '2 min' },
        { id: '2', title: 'Fondo de Emergencia', content: 'Debe cubrir de 3 a 6 meses de tus gastos fijos.', category: 'Ahorro', readTime: '1 min' },
        { id: '3', title: 'Interés Compuesto', content: 'El dinero que genera más dinero. Empieza cuanto antes.', category: 'Inversión', readTime: '3 min' },
    ];
};

export const generateDailySnaps = (goals: Goal[], streak: number): Snap[] => {
    const snaps: Snap[] = [];

    snaps.push({
        id: 'streak-intro',
        type: 'STREAK_SUMMARY',
        content: {
            title: `¡${streak} Días de Racha!`,
            subtitle: 'Tu constancia es la base de tu éxito financiero.',
            mediaUrl: 'https://images.unsplash.com/photo-1550534791-2677533605ab?q=80&w=1000&auto=format&fit=crop'
        }
    });

    return snaps;
};
