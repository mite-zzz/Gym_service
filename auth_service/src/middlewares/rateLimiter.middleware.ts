import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// ─────────────────────────────────────────────
//  Simple In-Memory Rate Limiter
//  (Replace with Redis-backed solution in prod)
// ─────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Purge expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Key generator function (defaults to IP) */
  keyFn?: (req: Request) => string;
}

/**
 * Creates a rate-limiting middleware.
 *
 * Usage:
 *   router.use(rateLimiter({ limit: 10, windowMs: 60_000 }))
 */
export function rateLimiter(opts: RateLimitOptions) {
  const { limit, windowMs, keyFn } = opts;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFn
      ? keyFn(req)
      : (req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown').toString();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      return next();
    }

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      return next(
        AppError.badRequest(
          `Too many requests. Please retry after ${retryAfter} seconds.`,
        ),
      );
    }

    entry.count += 1;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - entry.count);
    next();
  };
}
