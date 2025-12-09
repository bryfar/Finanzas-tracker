import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, AIFinancialAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

// Definición del Schema para la respuesta estructurada
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    healthScore: {
      type: Type.NUMBER,
      description: "Puntuación de 0 a 100 sobre la salud financiera del usuario.",
    },
    summary: {
      type: Type.STRING,
      description: "Un resumen ejecutivo breve del estado financiero.",
    },
    forecast: {
      type: Type.STRING,
      description: "Una predicción corta basada en los gastos actuales (ej: 'A este ritmo, ahorrarás X').",
    },
    tips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["ALTO", "MEDIO", "BAJO"] },
          actionable: { type: Type.BOOLEAN }
        },
        required: ["title", "description", "impact", "actionable"]
      }
    }
  },
  required: ["healthScore", "summary", "forecast", "tips"]
};

export const getFinancialHealthAnalysis = async (transactions: Transaction[]): Promise<AIFinancialAnalysis | null> => {
  try {
    const recentTransactions = transactions.slice(0, 50); 
    const transactionData = JSON.stringify(recentTransactions);
    
    const prompt = `
      Eres un analista financiero experto para un usuario en Perú (Moneda: Soles S/.).
      Analiza las siguientes transacciones (Nota: isFixed=true son gastos/ingresos fijos obligatorios).
      Genera un reporte JSON.
      Calcula una puntuación de salud (0=Bancarrota, 100=Libertad Financiera).
      Da consejos específicos considerando la economía local si aplica.
      
      Transacciones:
      ${transactionData}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.5,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIFinancialAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing finances:", error);
    return null;
  }
};

export const chatWithFinancialAdvisor = async (
  history: { role: 'user' | 'model', text: string }[], 
  currentMessage: string,
  contextData: Transaction[]
): Promise<string> => {
  try {
    const dataContext = JSON.stringify(contextData.slice(0, 30));
    
    const systemInstruction = `
      Eres FinanzasAI, un asistente financiero experto en Perú.
      La moneda es Nuevos Soles (S/.).
      Tienes acceso a las últimas transacciones del usuario (propiedad isFixed determina si es un gasto fijo obligado).
      Datos: ${dataContext}.
      Responde breve y útilmente.
    `;

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const response = await chat.sendMessage({
      message: currentMessage
    });

    return response.text || "No pude procesar tu respuesta.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Lo siento, tuve un problema conectando con el servicio.";
  }
};