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

**Dispatch** is a multi-agent support orchestration POC. The backend is an Express server (`src/server.ts`) with a single SSE endpoint `POST /api/chat`. The frontend is a vanilla JS/HTML single-page app in `public/index.html` that animates the routing decision in real time.

**Request flow:**

1. User submits a question via the chat UI
2. `POST /api/chat` streams Server-Sent Events back to the client
3. `orchestrate()` calls Gemini → gets `{ "routes": ["<agent>", ...] }` selecting one or more agents
4. All selected agents are called in parallel; each streams an `agent_answer` event when done
5. The UI animates chips: all pulse while routing, chosen chip snaps highlighted, others dim

**Agent structure (`src/agents/`):**

- `orchestrator.ts` — routes questions using Gemini. Falls back to `custom` if routing fails. Supports multi-agent routing (parallel calls).
- `productAgent.ts` — NordGear product catalogue + order data injected into system prompt
- `shippingAgent.ts` — NordGear shipping policy + order data injected into system prompt
- `refundAgent.ts` — NordGear return policy + order data injected into system prompt
- `customDataAgent.ts` — NordGear company info (hours, contact, policies). No order data.

**Synthetic data:**

- `data/orders.csv` — 50 synthetic NordGear e-commerce orders (loaded once at startup via `src/utils/loadOrders.ts`, cached in memory)
- Agents that receive order data: `product`, `shipping`, `refund`
- Demo questions: *"What is the status of order ORD-1042?"*, *"Can I return order ORD-1044?"*, *"Do the hiking boots come in wide fit?"*

Each agent uses `process.env.GEMINI_API_KEY` and the `gemini-3-flash-preview` model.

**Security:** `helmet` (security headers), `express-rate-limit` (100 req/15 min global, 10 req/min on `/api/chat`), CORS locked to `CORS_ORIGIN` env var (defaults to `http://localhost:<PORT>`).

**To add a new agent:** add an entry to `AgentName` in `src/types.ts`, create a new agent file in `src/agents/`, register it in the `agentMap` and routing prompt in `orchestrator.ts`, and add a chip to `public/index.html`.

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools — they are slow and unreliable.

Available gstack skills:

`/office-hours` `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` `/design-consultation` `/design-shotgun` `/review` `/ship` `/land-and-deploy` `/canary` `/benchmark` `/browse` `/connect-chrome` `/qa` `/qa-only` `/design-review` `/setup-browser-cookies` `/setup-deploy` `/retro` `/investigate` `/document-release` `/codex` `/cso` `/autoplan` `/careful` `/freeze` `/guard` `/unfreeze` `/gstack-upgrade`
