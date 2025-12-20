
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIInsight, EducationTip, AIPersonality, Snap, Goal, Investment } from "../types";

const modelId = "gemini-3-flash-preview";

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  transactions: Transaction[],
  streak: number,
  investments: Investment[] = [], // Contexto de inversiones añadido
  personality: AIPersonality = 'MOTIVATOR'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const txContext = JSON.stringify(transactions.slice(0, 20));
    const invContext = JSON.stringify(investments);
    
    let toneInstruction = "Profesional pero motivador.";
    if (personality === 'STRICT') toneInstruction = "Directo, disciplinado y enfocado en la austeridad.";
    if (personality === 'SARCASTIC') toneInstruction = "Humorístico, irónico pero con consejos financieros reales.";

    const systemInstruction = `
      Eres Finny, el Asesor Financiero Inteligente.
      
      PERSONALIDAD: ${toneInstruction}
      
      DATOS DEL USUARIO:
      - Racha actual: ${streak} días.
      - Últimas transacciones: ${txContext}
      - Inversiones Actuales: ${invContext}
      
      TU MISIÓN:
      - Si el usuario tiene inversiones, analiza si su TEA (tasa anual) es competitiva (En Perú, depósitos > 6% son buenos, < 4% son bajos).
      - Ayúdale a proyectar cuánto ganará.
      - Si no tiene inversiones, motívalo a crear su primer fondo de ahorro.
      - Sé conciso pero útil. Usa Markdown.
    `;

    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction },
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const response = await chat.sendMessage({ message: currentMessage });
    return response.text || "No pude procesar la respuesta.";
  } catch (error) {
    console.error("Gemini Chat error:", error);
    return "Ups, tuve un hipo financiero. ¿Me repites la pregunta?";
  }
};

export const detectAnomalies = (transactions: Transaction[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    if (expenses.length > 5) {
        const avg = expenses.reduce((s, t) => s + t.amount, 0) / expenses.length;
        expenses.filter(t => t.amount > avg * 2.5).forEach(t => {
            insights.push({ id: t.id, type: 'ANOMALY', message: `¡Ojo! Detecté un gasto muy alto de S/.${t.amount} en ${t.category}.`, date: t.date });
        });
    }
    return insights;
};

export const generateEducationTips = (transactions: Transaction[]): EducationTip[] => {
    return [
        { id: '1', title: '¿Qué es la TEA?', content: 'Es la Tasa Efectiva Anual. Es lo que realmente ganarás o pagarás por tu dinero en un año.', category: 'Conceptos', readTime: '1 min' },
        { id: '2', title: 'Interés Compuesto', content: 'Invertir tus ganancias para que generen más ganancias. Es la base de la riqueza.', category: 'Estrategia', readTime: '2 min' }
    ];
};

export const generateDailySnaps = (goals: Goal[], streak: number): Snap[] => {
    return [{
        id: 'welcome',
        type: 'STREAK_SUMMARY',
        content: { title: `¡Racha de ${streak} días!`, subtitle: 'Sigue registrando para que Finny pueda darte mejores consejos.', mediaUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000' }
    }];
};
