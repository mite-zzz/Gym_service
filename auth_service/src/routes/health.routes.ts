import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

// ─────────────────────────────────────────────
//  Health Check Routes
// ─────────────────────────────────────────────

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Service health check
 *     description: >
 *       Returns the operational status of the service and its
 *       database connection. Used by load balancers and orchestrators.
 *     responses:
 *       '200':
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                 db:
 *                   type: string
 *                   enum: [connected, disconnected]
 *       '503':
 *         description: Service is unhealthy (DB unreachable)
 */

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    // DB unreachable — still return a structured response
  }

  const healthy = dbStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    db: dbStatus,
  });
});

export default router;
