# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (ts-node, no build step)
npm run dev

# Build TypeScript to dist/
npm run build

# Run built output
npm start
```

Requires a `.env` file with `GEMINI_API_KEY=<your_key>` in the project root.

## Architecture

This is a multi-agent customer support chatbot. The backend is an Express server (`src/server.ts`) exposing a single endpoint `POST /api/chat`. The frontend is a vanilla JS/HTML single-page app served statically from `public/`.

**Request flow:**

1. User submits a question via the chat UI
2. `POST /api/chat` receives `{ question: string }`
3. `orchestrate()` calls Gemini with a routing prompt → gets back a JSON `{ "route": "<agent>" }` selecting one of four agents
4. The selected agent function is called with the original question → returns a plain text answer
5. Response `{ agent, answer }` is sent back; the UI highlights the active agent chip

**Agent structure (`src/agents/`):**

- `orchestrator.ts` — routes questions to the right agent using Gemini. Falls back to `custom` if routing fails.
- `productAgent.ts` — handles product/pricing/specs questions
- `shippingAgent.ts` — handles delivery/tracking questions
- `refundAgent.ts` — handles returns/cancellations
- `customDataAgent.ts` — handles company-specific questions; the `CUSTOM_KNOWLEDGE` constant at the top is where you inject company-specific facts

Each agent creates its own `GoogleGenerativeAI` instance using `process.env.GEMINI_API_KEY`. All agents use the `gemini-3-flash-preview` model.

**To add a new agent:** add an entry to `AgentName` in `src/types.ts`, create a new agent file in `src/agents/`, register it in the `agentMap` and routing prompt in `orchestrator.ts`, and add a chip to `public/index.html`.
