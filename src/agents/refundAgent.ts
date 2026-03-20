import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a refund and returns specialist for an e-commerce company.
You help customers with refund requests, return policies, order cancellations, and dispute resolutions.
Be empathetic, helpful, and concise. Our standard return policy is 30 days with receipt.
If you don't have specific order information, provide general guidance on how to proceed.
Keep answers under 3 sentences.`;

export async function refundAgent(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
