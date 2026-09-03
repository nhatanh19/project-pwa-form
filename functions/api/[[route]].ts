import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';
import { Env } from '../types/env';
import { questionsRouter } from './routes/questions';
import { syncRouter } from './routes/sync';
import { analyticsRouter } from './routes/analytics';
import { exportRouter } from './routes/export';

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// CORS & Middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint: GET /api/health
app.get('/health', (c) => {
  const isDbBound = !!c.env?.DB;
  return c.json({
    status: 'ok',
    app: 'Traffic Habit Field Survey PWA',
    d1_database_bound: isDbBound,
    timestamp: new Date().toISOString(),
  });
});

// Gắn các API routes: /api/questions, /api/sync, /api/analytics, /api/export
app.route('/questions', questionsRouter);
app.route('/sync', syncRouter);
app.route('/analytics', analyticsRouter);
app.route('/export', exportRouter);

export const onRequest = handle(app);
