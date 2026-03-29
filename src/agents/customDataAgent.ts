import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CUSTOM_KNOWLEDGE = `
Company name: NordGear
Industry: Outdoor & sports equipment
HQ: Oslo, Norway
Working hours: Monday–Friday, 8am–6pm CET
Phone: +47 21 00 00 00
Email: support@nordgear.no
Free shipping on orders over €75
Ships to 20 European countries
Premium members get priority support within 1 hour.
Standard support response time is 24 hours.
`;

const SYSTEM_PROMPT = `You are a customer support agent for NordGear, an outdoor & sports equipment store.
Use the following company information to answer customer questions accurately:

${CUSTOM_KNOWLEDGE}

Be helpful, concise, and friendly. Keep answers under 3 sentences.`;

export async function customDataAgent(question: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(question);
  return result.response.text();
}
