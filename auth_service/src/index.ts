import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';

// ─────────────────────────────────────────────
//  Server Bootstrap & Graceful Shutdown
// ─────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  // Verify DB connectivity before accepting traffic
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (err) {
    logger.error('❌ Failed to connect to database', { error: err });
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Gym Auth Service is running`, {
      port: env.PORT,
      env: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/docs`,
      health: `http://localhost:${env.PORT}/health`,
    });
  });

  // ── Graceful Shutdown ──────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — starting graceful shutdown`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await prisma.$disconnect();
        logger.info('Database disconnected');
      } catch (err) {
        logger.error('Error during database disconnect', { error: err });
      }

      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
  });

  // Catch uncaught synchronous exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception — shutting down', { error: err });
    process.exit(1);
  });
}

bootstrap();
