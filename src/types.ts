export type AgentName = 'product' | 'shipping' | 'refund' | 'custom';
export type SseEmit = (event: string, data: object) => void;

export interface ChatRequest {
  question: string;
}
