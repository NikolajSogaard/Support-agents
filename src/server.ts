import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { orchestrate } from './agents/orchestrator';
import { ChatRequest, SseEmit } from './types';

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_QUESTION_LENGTH = 500;

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit reached. Please wait a moment.' },
});

app.use(globalLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Chat endpoint — SSE
app.post('/api/chat', chatLimiter, async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    res.status(400).json({ error: 'question is required' });
    return;
  }
  if (question.trim().length > MAX_QUESTION_LENGTH) {
    res.status(400).json({ error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.` });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const emit: SseEmit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await orchestrate(question.trim(), emit);
  } catch (err) {
    console.error('Orchestration error:', err);
    emit('error', { message: 'Failed to process your question. Please try again.' });
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Support agents server running at http://localhost:${PORT}`);
});
