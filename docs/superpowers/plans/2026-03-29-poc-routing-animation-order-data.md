# POC — Routing Animation + Synthetic Order Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the multi-agent routing decision visually dramatic using chip animations, and give agents real-looking NordGear e-commerce order data to answer questions from.

**Architecture:** A `data/orders.csv` file holds 50 synthetic orders. A `loadOrders()` utility reads it once at startup and caches it. The product, shipping, and refund agents inject the full CSV string into their system prompts. The frontend gains CSS pulse/dim animations driven by the existing SSE `routing` events — no backend changes needed.

**Tech Stack:** TypeScript, Express, Node.js `fs`, Gemini `gemini-3-flash-preview`, vanilla JS/CSS

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Create | `data/orders.csv` | 50 synthetic NordGear orders |
| Create | `src/utils/loadOrders.ts` | Read + cache CSV at startup |
| Modify | `src/agents/customDataAgent.ts` | NordGear company info (no order data) |
| Modify | `src/agents/productAgent.ts` | NordGear products + inject order data |
| Modify | `src/agents/shippingAgent.ts` | NordGear shipping policy + inject order data |
| Modify | `src/agents/refundAgent.ts` | NordGear return policy + inject order data |
| Modify | `public/index.html` | CSS chip animations + JS dispatch updates + NordGear branding |

---

## Task 1: Create synthetic order data

**Files:**
- Create: `data/orders.csv`

- [ ] **Step 1: Create `data/orders.csv`**

Create the file with this exact content (50 rows):

```csv
order_id,customer_name,email,product,quantity,price,order_date,status,tracking_number,estimated_delivery,return_eligible,return_status
ORD-1001,Emma Hansen,emma.hansen@nordgear.no,Trail Backpack 35L,1,€189,2026-03-01,Delivered,DHL-88101,2026-03-05,yes,none
ORD-1002,Lars Berg,lars.berg@nordgear.no,Hiking Boots EU 43,1,€129,2026-03-02,Delivered,DHL-88102,2026-03-06,yes,none
ORD-1003,Sofia Lind,sofia.lind@nordgear.no,Waterproof Jacket M,1,€249,2026-02-14,Delivered,DHL-88103,2026-02-18,yes,requested
ORD-1004,Erik Johansen,erik.johansen@nordgear.no,Merino Base Layer L,2,€158,2026-03-10,Delivered,DHL-88104,2026-03-14,yes,none
ORD-1005,Maja Nilsson,maja.nilsson@nordgear.no,Trekking Poles,1,€59,2026-03-05,Delivered,DHL-88105,2026-03-09,yes,none
ORD-1006,Ole Andersen,ole.andersen@nordgear.no,Hiking Boots EU 41,1,€129,2026-03-15,Shipped,DHL-99201,2026-03-22,yes,none
ORD-1007,Astrid Svensson,astrid.svensson@nordgear.no,Waterproof Jacket S,1,€249,2026-03-18,Shipped,DHL-99202,2026-03-25,yes,none
ORD-1008,Bjorn Karlsson,bjorn.karlsson@nordgear.no,Trail Backpack 35L,1,€189,2026-03-20,Shipped,DHL-99203,2026-03-27,yes,none
ORD-1009,Ingrid Petersen,ingrid.petersen@nordgear.no,Merino Base Layer S,1,€79,2026-03-22,Shipped,DHL-99204,2026-03-29,yes,none
ORD-1010,Knut Larsen,knut.larsen@nordgear.no,Trekking Poles,2,€118,2026-03-24,Shipped,DHL-99205,2026-03-31,yes,none
ORD-1011,Freya Eriksson,freya.eriksson@nordgear.no,Hiking Boots EU 38,1,€129,2026-03-25,Shipped,DHL-99206,2026-04-01,yes,none
ORD-1012,Sigrid Nielsen,sigrid.nielsen@nordgear.no,Waterproof Jacket L,1,€249,2026-03-26,Processing,,,yes,none
ORD-1013,Torbjorn Magnusson,torbjorn.magnusson@nordgear.no,Trail Backpack 35L,1,€189,2026-03-27,Processing,,,yes,none
ORD-1014,Helga Gustafsson,helga.gustafsson@nordgear.no,Merino Base Layer M,1,€79,2026-03-27,Processing,,,yes,none
ORD-1015,Magnus Holm,magnus.holm@nordgear.no,Hiking Boots EU 45,1,€129,2026-03-28,Processing,,,yes,none
ORD-1016,Ragnhild Christensen,ragnhild.christensen@nordgear.no,Trekking Poles,1,€59,2026-03-28,Processing,,,yes,none
ORD-1017,Gunnar Lindqvist,gunnar.lindqvist@nordgear.no,Waterproof Jacket XL,1,€249,2026-03-29,Processing,,,yes,none
ORD-1018,Britta Johansson,britta.johansson@nordgear.no,Trail Backpack 35L,2,€378,2026-03-29,Processing,,,yes,none
ORD-1019,Vidar Olsen,vidar.olsen@nordgear.no,Hiking Boots EU 44,1,€129,2026-03-10,Delivered,DHL-88106,2026-03-14,yes,requested
ORD-1020,Solveig Pettersen,solveig.pettersen@nordgear.no,Merino Base Layer XL,1,€79,2026-03-08,Delivered,DHL-88107,2026-03-12,yes,approved
ORD-1021,Anders Strand,anders.strand@nordgear.no,Waterproof Jacket M,1,€249,2026-02-20,Delivered,DHL-88108,2026-02-24,yes,completed
ORD-1022,Kari Haugen,kari.haugen@nordgear.no,Trekking Poles,1,€59,2026-03-12,Delivered,DHL-88109,2026-03-16,yes,none
ORD-1023,Per Nygaard,per.nygaard@nordgear.no,Trail Backpack 35L,1,€189,2026-03-03,Delivered,DHL-88110,2026-03-07,yes,none
ORD-1024,Tonje Bakken,tonje.bakken@nordgear.no,Hiking Boots EU 37,1,€129,2026-03-06,Delivered,DHL-88111,2026-03-10,yes,none
ORD-1025,Svein Dahl,svein.dahl@nordgear.no,Merino Base Layer L,1,€79,2026-03-07,Delivered,DHL-88112,2026-03-11,no,none
ORD-1026,Hanne Berg,hanne.berg@nordgear.no,Waterproof Jacket XXL,1,€249,2026-03-09,Delivered,DHL-88113,2026-03-13,yes,none
ORD-1027,Truls Hansen,truls.hansen@nordgear.no,Trail Backpack 35L,1,€189,2026-02-28,Delivered,DHL-88114,2026-03-04,yes,requested
ORD-1028,Lene Sorensen,lene.sorensen@nordgear.no,Trekking Poles,1,€59,2026-03-11,Delivered,DHL-88115,2026-03-15,yes,none
ORD-1029,Dag Johannessen,dag.johannessen@nordgear.no,Hiking Boots EU 42,1,€129,2026-03-13,Delivered,DHL-88116,2026-03-17,yes,none
ORD-1030,Randi Olsson,randi.olsson@nordgear.no,Merino Base Layer M,3,€237,2026-03-16,Delivered,DHL-88117,2026-03-20,yes,none
ORD-1031,Finn Andersen,finn.andersen@nordgear.no,Waterproof Jacket L,1,€249,2026-03-17,Delivered,DHL-88118,2026-03-21,yes,none
ORD-1032,Silje Nilsson,silje.nilsson@nordgear.no,Trail Backpack 35L,1,€189,2026-03-19,Delivered,DHL-88119,2026-03-23,yes,none
ORD-1033,Morten Karlsen,morten.karlsen@nordgear.no,Trekking Poles,2,€118,2026-03-21,Delivered,DHL-88120,2026-03-25,yes,none
ORD-1034,Camilla Eriksen,camilla.eriksen@nordgear.no,Hiking Boots EU 40,1,€129,2026-03-23,Shipped,DHL-99207,2026-03-30,yes,none
ORD-1035,Jonas Lindgren,jonas.lindgren@nordgear.no,Merino Base Layer S,1,€79,2026-02-10,Delivered,DHL-88121,2026-02-14,no,none
ORD-1036,Maria Petersen,maria.petersen@nordgear.no,Waterproof Jacket S,1,€249,2026-02-18,Delivered,DHL-88122,2026-02-22,yes,approved
ORD-1037,Henrik Strand,henrik.strand@nordgear.no,Trail Backpack 35L,1,€189,2026-03-14,Delivered,DHL-88123,2026-03-18,yes,none
ORD-1038,Tone Haugen,tone.haugen@nordgear.no,Hiking Boots EU 36,1,€129,2026-03-15,Shipped,DHL-99208,2026-03-22,yes,none
ORD-1039,Roar Magnusson,roar.magnusson@nordgear.no,Trekking Poles,1,€59,2026-03-23,Shipped,DHL-99209,2026-03-30,yes,none
ORD-1040,Grethe Gustafsson,grethe.gustafsson@nordgear.no,Merino Base Layer L,1,€79,2026-03-24,Shipped,DHL-99210,2026-03-31,yes,none
ORD-1041,Pal Holm,pal.holm@nordgear.no,Waterproof Jacket M,1,€249,2026-03-25,Shipped,DHL-99211,2026-04-01,yes,none
ORD-1042,Emma Hansen,emma.hansen@nordgear.no,Trail Backpack 35L,1,€189,2026-03-10,Shipped,DHL-99281,2026-03-31,yes,none
ORD-1043,Lars Berg,lars.berg@nordgear.no,Hiking Boots EU 43,1,€129,2026-03-20,Processing,,,yes,none
ORD-1044,Sofia Lind,sofia.lind@nordgear.no,Waterproof Jacket M,1,€249,2026-02-14,Delivered,DHL-88201,2026-02-18,yes,requested
ORD-1045,Nils Svensson,nils.svensson@nordgear.no,Merino Base Layer XL,2,€158,2026-03-26,Processing,,,yes,none
ORD-1046,Astrid Karlsson,astrid.karlsson@nordgear.no,Hiking Boots EU 39,1,€129,2026-03-27,Processing,,,yes,none
ORD-1047,Erik Johansen,erik.johansen@nordgear.no,Trekking Poles,1,€59,2026-03-01,Delivered,DHL-88202,2026-03-05,yes,none
ORD-1048,Maja Nilsson,maja.nilsson@nordgear.no,Trail Backpack 35L,1,€189,2026-03-28,Processing,,,yes,none
ORD-1049,Ole Andersen,ole.andersen@nordgear.no,Waterproof Jacket L,1,€249,2026-03-05,Delivered,DHL-88203,2026-03-09,yes,none
ORD-1050,Vidar Olsen,vidar.olsen@nordgear.no,Hiking Boots EU 46,1,€129,2026-03-15,Cancelled,,,no,none
```

- [ ] **Step 2: Commit**

```bash
git add data/orders.csv
git commit -m "feat: add synthetic NordGear order data (50 rows)"
```

---

## Task 2: Create `loadOrders` utility

**Files:**
- Create: `src/utils/loadOrders.ts`

- [ ] **Step 1: Create `src/utils/loadOrders.ts`**

```typescript
import fs from 'fs';
import path from 'path';

let cache: string | null = null;

export function loadOrders(): string {
  if (cache !== null) return cache;
  const csvPath = path.join(process.cwd(), 'data', 'orders.csv');
  cache = fs.readFileSync(csvPath, 'utf-8');
  return cache;
}
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: exits with code 0, no errors printed.

- [ ] **Step 3: Commit**

```bash
git add src/utils/loadOrders.ts
git commit -m "feat: add loadOrders utility (cached CSV read)"
```

---

## Task 3: Update `customDataAgent.ts` with NordGear data

**Files:**
- Modify: `src/agents/customDataAgent.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
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
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/agents/customDataAgent.ts
git commit -m "feat: update customDataAgent with NordGear company info"
```

---

## Task 4: Update `productAgent.ts` with order data + NordGear catalogue

**Files:**
- Modify: `src/agents/productAgent.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
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
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/agents/productAgent.ts
git commit -m "feat: update productAgent with NordGear catalogue and order data"
```

---

## Task 5: Update `shippingAgent.ts` with order data + NordGear policy

**Files:**
- Modify: `src/agents/shippingAgent.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
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
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/agents/shippingAgent.ts
git commit -m "feat: update shippingAgent with NordGear policy and order data"
```

---

## Task 6: Update `refundAgent.ts` with order data + NordGear policy

**Files:**
- Modify: `src/agents/refundAgent.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
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
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/agents/refundAgent.ts
git commit -m "feat: update refundAgent with NordGear policy and order data"
```

---

## Task 7: Frontend — CSS chip animation states + routing label

**Files:**
- Modify: `public/index.html` (CSS `<style>` block and HTML body only)

- [ ] **Step 1: Add CSS animation styles**

In `public/index.html`, add the following CSS inside the existing `<style>` block, after the `.agent-chip.active .dot` rule (after line 69):

```css
    @keyframes chipPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.25); }
      50%       { box-shadow: 0 0 0 7px rgba(37, 99, 235, 0); }
    }

    .agent-chip.considering {
      border-color: #93c5fd;
      background: #f0f7ff;
      animation: chipPulse 1s ease-in-out infinite;
    }

    .agent-chip.considering .dot {
      background: #93c5fd;
    }

    .agent-chip.selected {
      border-color: #2563eb;
      background: #eff6ff;
      color: #2563eb;
      transform: scale(1.08);
      box-shadow: 0 0 0 3px #bfdbfe;
      animation: none;
    }

    .agent-chip.selected .dot {
      background: #2563eb;
      box-shadow: 0 0 0 3px #bfdbfe;
    }

    .agent-chip.dimmed {
      opacity: 0.35;
      animation: none;
    }

    .routing-label {
      font-size: 0.78rem;
      color: #6b7280;
      text-align: center;
      min-height: 22px;
      margin-top: -18px;
      margin-bottom: 10px;
      transition: opacity 0.3s;
    }

    .routing-label span {
      background: #eff6ff;
      color: #2563eb;
      border-radius: 999px;
      padding: 2px 10px;
      font-weight: 600;
      border: 1px solid #bfdbfe;
    }
```

- [ ] **Step 2: Add routing label element to HTML**

In `public/index.html`, add a `<div>` for the routing label between `.agents-bar` and `.chat-container`. Replace this line:

```html
  <div class="chat-container">
```

with:

```html
  <div class="routing-label" id="routing-label"></div>

  <div class="chat-container">
```

- [ ] **Step 3: Update the page header and empty state**

Replace the `<header>` block:

```html
  <header>
    <h1>Support Agents</h1>
    <p>Ask anything — our AI routes your question to the right specialist(s).</p>
  </header>
```

with:

```html
  <header>
    <h1>NordGear Support</h1>
    <p>Ask anything — our AI routes your question to the right specialist.</p>
  </header>
```

Replace the empty state `<p>`:

```html
        <p>Ask a question to get started.<br/>Try: "Can I get a refund for my shipped order #847291?"</p>
```

with:

```html
        <p>Ask a question to get started.<br/>Try: "Where is order ORD-1042?" or "Can I return order ORD-1044?"</p>
```

- [ ] **Step 4: Commit the CSS + HTML changes**

```bash
git add public/index.html
git commit -m "feat: add chip animation CSS and routing label element"
```

---

## Task 8: Frontend — JS routing animation logic

**Files:**
- Modify: `public/index.html` (`<script>` block only)

- [ ] **Step 1: Replace `resetChips` function**

Find and replace the `resetChips` function (currently lines ~302-304):

```javascript
    function resetChips() {
      Object.values(chips).forEach(el => el.classList.remove('active'));
    }
```

Replace with:

```javascript
    function resetChips() {
      Object.values(chips).forEach(el =>
        el.classList.remove('active', 'considering', 'selected', 'dimmed'));
      const labelEl = document.getElementById('routing-label');
      if (labelEl) labelEl.innerHTML = '';
    }
```

- [ ] **Step 2: Add `setChipsConsidering` and `setChipsDecided` functions**

Add these two functions immediately after `resetChips`:

```javascript
    function setChipsConsidering() {
      Object.values(chips).forEach(el => {
        el.classList.remove('selected', 'dimmed', 'active');
        el.classList.add('considering');
      });
    }

    function setChipsDecided(routes) {
      Object.entries(chips).forEach(([key, el]) => {
        el.classList.remove('considering', 'active');
        if (routes.includes(key)) {
          el.classList.add('selected');
          el.classList.remove('dimmed');
        } else {
          el.classList.add('dimmed');
          el.classList.remove('selected');
        }
      });
      const names = routes.map(r => agentLabels[r] || r).join(', ');
      const labelEl = document.getElementById('routing-label');
      if (labelEl) labelEl.innerHTML = `Routed to: <span>${names}</span>`;
    }
```

- [ ] **Step 3: Update the `routing` case in `dispatch`**

Find and replace the `routing` case in the `dispatch` function:

```javascript
        case 'routing':
          if (payload.status === 'thinking') {
            updateThinking('Routing your question...');
          } else if (payload.status === 'decided') {
            const names = payload.routes.map(r => agentLabels[r] || r).join(', ');
            updateThinking(`Calling: ${names}...`);
            activateChips(payload.routes);
          }
          break;
```

Replace with:

```javascript
        case 'routing':
          if (payload.status === 'thinking') {
            setChipsConsidering();
            updateThinking('Routing your question...');
          } else if (payload.status === 'decided') {
            setChipsDecided(payload.routes);
            const names = payload.routes.map(r => agentLabels[r] || r).join(', ');
            updateThinking(`Calling: ${names}...`);
          }
          break;
```

- [ ] **Step 4: Remove `activateChips` function (now unused)**

Find and remove the entire `activateChips` function:

```javascript
    function activateChips(agentArray) {
      Object.entries(chips).forEach(([key, el]) =>
        el.classList.toggle('active', agentArray.includes(key)));
    }
```

- [ ] **Step 5: Commit**

```bash
git add public/index.html
git commit -m "feat: add routing chip animation — pulse on thinking, snap on decided"
```

---

## Task 9: Smoke test

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 2: Start server**

```bash
npm start
```

Expected output:
```
Support agents server running at http://localhost:3000
```

- [ ] **Step 3: Open browser and test these questions**

Navigate to `http://localhost:3000` and test each question. Verify the chip animation fires (all chips pulse → one snaps highlighted, others dim) and the answer references real order data:

| Question | Expected routed chip | Expected answer content |
|---|---|---|
| `What is the status of order ORD-1042?` | Shipping (blue highlight) | Shipped, DHL-99281, est. 2026-03-31 |
| `Has Sofia's refund for order ORD-1044 been processed?` | Refund (blue highlight) | return_status: requested, not yet processed |
| `Do the hiking boots come in wide fit?` | Product (blue highlight) | Wide-fit option available |
| `What are your support hours?` | Custom data (blue highlight) | Mon–Fri 8am–6pm CET |
| `Can I return order ORD-1050?` | Refund (blue highlight) | Not eligible for return |

- [ ] **Step 4: Final commit if any last fixes were needed**

```bash
git add -p
git commit -m "fix: smoke test corrections"
```
