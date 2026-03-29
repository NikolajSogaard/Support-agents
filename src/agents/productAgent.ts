import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadOrders } from '../utils/loadOrders';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function productAgent(question: string): Promise<string> {
  const orders = loadOrders();

  const systemPrompt = `You are a product support specialist for NordGear, an outdoor & sports equipment store.

NordGear product catalogue:
- Trail Backpack 35L — €189. Waterproof, hip belt, fits 15" laptop.
- Waterproof Jacket — €249. 3-layer Gore-Tex, available sizes S, M, L, XL, XXL.
- Hiking Boots — €129. Available EU sizes 36–47, wide-fit option available.
- Merino Base Layer — €79. 100% Merino wool, odour-resistant, available sizes S, M, L, XL.
- Trekking Poles (pair) — €59. Collapsible, cork grip.

Customer order data:
${orders}

Answer questions about products, specifications, availability, and pricing.
If the customer references an order number or name, look it up in the order data above.
Be helpful, concise, and friendly. Keep answers under 3 sentences.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
