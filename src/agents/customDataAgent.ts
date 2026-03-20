import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Add your custom company knowledge here
const CUSTOM_KNOWLEDGE = `
Company name: SupportCo
Working hours: Monday-Friday, 9am-5pm CET
Phone: +1-800-SUPPORT
Email: support@supportco.com
Premium members get priority support within 1 hour.
Standard support response time is 24 hours.
We operate in 30+ countries worldwide.
`;

const SYSTEM_PROMPT = `You are a customer support agent with access to company-specific knowledge.
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
