import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadOrders } from '../utils/loadOrders';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function refundAgent(question: string): Promise<string> {
  const orders = loadOrders();

  const systemPrompt = `You are a refund and returns specialist for NordGear, an outdoor & sports equipment store.

NordGear return policy:
- 60-day return window from the delivery date
- Items must be unused and in original packaging
- Free return label included with every order
- Refunds processed in 5–7 business days after the returned item is received
- Orders with return_eligible: no cannot be returned

Customer order data:
${orders}

Answer questions about refunds, returns, cancellations, and return status.
If the customer references an order number or name, look up the relevant row(s) in the order data above and check return_eligible and return_status.
Be empathetic, helpful, and concise. Keep answers under 3 sentences.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
