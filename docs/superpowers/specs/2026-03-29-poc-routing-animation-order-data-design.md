# Design: POC — Routing Animation + Synthetic Order Data

**Date:** 2026-03-29
**Goal:** Make the multi-agent routing decision the visual centrepiece of the demo, backed by realistic synthetic e-commerce order data that agents can query.

---

## 1. Routing Animation (Frontend)

The existing SSE event stream already carries the routing state. The frontend maps events to a deliberation → decision animation:

| SSE event | UI behaviour |
|---|---|
| `routing { status: 'thinking' }` | All 4 agent chips enter a soft CSS pulse animation — "under consideration" |
| `routing { status: 'decided', routes: ['x'] }` | Chosen chip snaps to bold highlight; unchosen chips dim to 40% opacity; pulse stops |
| `agent_answer { agent, answer }` | "Routed to: **[Agent Name]**" label fades in beneath chips; answer streams word-by-word |
| `done` | Chips return to neutral; routed-to label persists until next message |

No backend changes required for the animation. All changes are in `public/index.html`.

### CSS states needed
- `.chip--considering` — pulsing glow (keyframe animation)
- `.chip--selected` — bold highlight colour (e.g. accent blue/green)
- `.chip--dimmed` — 40% opacity
- `.routing-label` — small fade-in text beneath the chip row

---

## 2. Synthetic Order Data

### File
`data/orders.csv` — ~50 rows, loaded once at server start.

### Schema
| Column | Example |
|---|---|
| `order_id` | `ORD-1042` |
| `customer_name` | `Emma Hansen` |
| `email` | `emma@example.com` |
| `product` | `Trail Backpack 35L` |
| `quantity` | `1` |
| `price` | `€189` |
| `order_date` | `2026-03-10` |
| `status` | `Shipped` / `Processing` / `Delivered` / `Cancelled` |
| `tracking_number` | `DHL-99281` (blank if not yet shipped) |
| `estimated_delivery` | `2026-03-31` (blank if not yet shipped) |
| `return_eligible` | `yes` / `no` |
| `return_status` | `none` / `requested` / `approved` / `completed` |

### Data characteristics
- ~50 rows covering a realistic spread of statuses
- Mix of Norwegian/Nordic customer names to match the NordGear brand
- Products drawn from the NordGear catalogue (see Section 3)
- Some orders with pending returns, some with active tracking, some delivered

---

## 3. NordGear Brand + Company Data

Replaces the "SupportCo" placeholder throughout.

**Company:** NordGear — outdoor & sports equipment, ships across Europe, HQ in Oslo.

### Product catalogue (used in `productAgent` system prompt)
| Product | Price | Key specs |
|---|---|---|
| Trail Backpack 35L | €189 | Waterproof, hip belt, fits 15" laptop |
| Waterproof Jacket | €249 | 3-layer Gore-Tex, available S–XXL |
| Hiking Boots | €129 | Available EU 36–47, wide-fit option |
| Merino Base Layer | €79 | 100% Merino wool, odour-resistant |
| Trekking Poles (pair) | €59 | Collapsible, cork grip |

### Company info (used in `customDataAgent` system prompt)
- Hours: Monday–Friday, 8am–6pm CET
- Phone: +47 21 00 00 00
- Email: support@nordgear.no
- Free shipping on orders over €75
- Ships to 20 European countries

### Return policy (used in `refundAgent` system prompt)
- 60-day return window
- Items must be unused and in original packaging
- Free return label included
- Refund processed in 5–7 business days

### Shipping policy (used in `shippingAgent` system prompt)
- Norway/Sweden: 2–4 business days (DHL)
- Rest of Europe: 3–6 business days (DHL)
- Tracking available via DHL with provided tracking number

---

## 4. Architecture Changes

### New file: `src/utils/loadOrders.ts`
Reads `data/orders.csv` at server start, returns the CSV content as a plain string. Agents inject this string into their system prompt.

### Agent system prompt updates
| Agent | Gets order data? | Gets company/product data? |
|---|---|---|
| `orchestrator.ts` | No | No |
| `productAgent.ts` | Yes | Yes (product catalogue) |
| `shippingAgent.ts` | Yes | Yes (shipping policy) |
| `refundAgent.ts` | Yes | Yes (return policy) |
| `customDataAgent.ts` | No | Yes (company info) |

### Why inject the full CSV?
~50 rows is well within Gemini's context window. No vector search, no lookup step, no extra infrastructure. The LLM finds the relevant row naturally from the question. Correct approach for a POC.

---

## 5. Demo Questions

These should all route correctly and return data-grounded answers:

| Question | Expected agent |
|---|---|
| "What's the status of order ORD-1042?" | shipping |
| "Has Sofia's refund been approved?" | refund |
| "Do the hiking boots come in wide fit?" | product |
| "What are your opening hours?" | custom |
| "Can I return order ORD-1044? It was delivered last month." | refund |
| "Where is Lars's order?" | shipping |
| "What's the difference between the jacket and the base layer?" | product |

---

## 6. Out of Scope

- Authentication or user login
- Persistent conversation history
- Real DHL API integration
- Database — CSV file only
- Multiple parallel agent answers (routing to one agent per question for the POC)
