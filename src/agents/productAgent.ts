import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a product support specialist for an e-commerce company.
You help customers with questions about products, features, availability, pricing, and specifications.
Be helpful, concise, and friendly. If you don't have specific product information, provide general guidance.
Keep answers under 3 sentences.`;

export async function productAgent(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
