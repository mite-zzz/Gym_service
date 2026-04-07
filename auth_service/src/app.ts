import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// ─────────────────────────────────────────────
//  Application Factory
// ─────────────────────────────────────────────

export function createApp(): Application {
  const app = express();

  // ── Security headers ───────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ── CORS ───────────────────────────────────
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., server-to-server, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" is not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ── Body parsing ───────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── HTTP request logging ───────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
        stream: { write: (msg) => logger.http(msg.trim()) },
      }),
    );
  }

  // ── Trust proxy (for correct IP behind load balancer) ──
  app.set('trust proxy', 1);

  // ── Swagger docs ───────────────────────────
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: '🏋️ Gym Auth API Docs',
      customCss: `
        .swagger-ui .topbar { background-color: #1a1a2e; }
        .swagger-ui .topbar-wrapper img { content: none; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
      },
    }),
  );

  // Raw OpenAPI spec endpoint
  app.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ── Routes ─────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);

  // ── 404 & Error handling ───────────────────
  // Order matters: 404 first, then global error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
