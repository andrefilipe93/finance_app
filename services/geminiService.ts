
import { GoogleGenAI } from "@google/genai";
import type { Transaction, Category } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function analyzeExpenses(transactions: Transaction[], categories: Category[]): Promise<string> {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const summary = transactions.reduce((acc, t) => {
        const categoryName = categoryMap.get(t.categoryId) || 'Desconhecido';
        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += t.amount;
        return acc;
    }, {} as Record<string, number>);

    const formattedSummary = Object.entries(summary)
        .map(([category, total]) => `- ${category}: ${total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`)
        .join('\n');

    const prompt = `
        Você é um consultor financeiro amigável e motivacional. Analise o seguinte resumo de despesas e forneça 3 dicas práticas e acionáveis para ajudar o usuário a economizar dinheiro.
        A resposta deve ser em português de Portugal. Formate a resposta de forma clara e concisa, usando emojis para torná-la mais agradável.

        Resumo de Despesas:
        ${formattedSummary}

        Seja encorajador e forneça conselhos realistas.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Não foi possível obter a análise da IA.");
    }
}