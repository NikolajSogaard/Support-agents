import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadOrders } from '../utils/loadOrders';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function shippingAgent(question: string): Promise<string> {
  const orders = loadOrders();

  const systemPrompt = `You are a shipping and delivery support specialist for NordGear, an outdoor & sports equipment store.

NordGear shipping policy:
- Norway/Sweden: 2–4 business days via DHL
- Rest of Europe: 3–6 business days via DHL
- Free shipping on orders over €75
- Tracking available via DHL once order is shipped (tracking number provided at shipment)

Customer order data:
${orders}

Answer questions about delivery times, order status, tracking numbers, and lost packages.
If the customer references an order number, name, or product, look up the relevant row(s) in the order data above.
Be helpful, concise, and friendly. Keep answers under 3 sentences.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
