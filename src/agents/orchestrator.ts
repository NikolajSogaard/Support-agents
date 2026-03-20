import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentName, SseEmit } from '../types';
import { productAgent } from './productAgent';
import { shippingAgent } from './shippingAgent';
import { refundAgent } from './refundAgent';
import { customDataAgent } from './customDataAgent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VALID_AGENTS: AgentName[] = ['product', 'shipping', 'refund', 'custom'];

const ORCHESTRATOR_PROMPT = `You are a customer support router. Analyze the customer's question and determine which specialist agent(s) should handle it.

Respond with ONLY a valid JSON object in this exact format: {"routes": ["<agent>", ...]}

You may include one OR multiple agents if the question spans multiple topics.

Choose from these agents:
- "product" — product info, features, availability, pricing, specifications
- "shipping" — delivery, tracking, shipping times, lost packages
- "refund" — refunds, returns, cancellations, disputes
- "custom" — company info, contact details, policies, hours, anything else

Examples:
Q: "What are the specs of the Pro plan?" → {"routes": ["product"]}
Q: "Where is my order #12345?" → {"routes": ["shipping"]}
Q: "Can I return this item?" → {"routes": ["refund"]}
Q: "What are your support hours?" → {"routes": ["custom"]}
Q: "Can I refund an order that already shipped?" → {"routes": ["refund", "shipping"]}
Q: "What are your hours and do you ship internationally?" → {"routes": ["custom", "shipping"]}`;

const agentMap: Record<AgentName, (q: string) => Promise<string>> = {
  product: productAgent,
  shipping: shippingAgent,
  refund: refundAgent,
  custom: customDataAgent,
};

export async function orchestrate(question: string, emit: SseEmit): Promise<void> {
  emit('routing', { status: 'thinking' });

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: ORCHESTRATOR_PROMPT,
  });

  const result = await model.generateContent(question);
  const text = result.response.text().trim();

  let routes: AgentName[] = [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.routes)) {
      routes = parsed.routes.filter(
        (r: string) => (VALID_AGENTS as string[]).includes(r)
      ) as AgentName[];
    }
  } catch {
    // Try extracting JSON from markdown code block or surrounding text
    const m = text.match(/\{[\s\S]*?\}/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        if (Array.isArray(parsed.routes)) {
          routes = parsed.routes.filter(
            (r: string) => (VALID_AGENTS as string[]).includes(r)
          ) as AgentName[];
        }
      } catch {
        // fall through to default
      }
    }
  }

  if (routes.length === 0) routes = ['custom'];

  emit('routing', { status: 'decided', routes });

  // Signal all agents starting immediately
  for (const agent of routes) {
    emit('agent_start', { agent });
  }

  // Call all agents in parallel
  await Promise.all(
    routes.map(agent =>
      agentMap[agent](question)
        .then(answer => emit('agent_answer', { agent, answer }))
        .catch(() => emit('agent_error', { agent, message: 'Agent temporarily unavailable.' }))
    )
  );

  emit('done', {});
}
