import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';

// ─────────────────────────────────────────────
//  Auth Routes
// ─────────────────────────────────────────────

const router = Router();

// Strict rate limit on auth mutations to deter brute-force attacks
const authLimiter = rateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 }); // 10 req / 15 min

/**
 * POST /auth/register
 * Public — creates a new user account
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * POST /auth/login
 * Public — returns a JWT on valid credentials
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * GET /auth/me
 * Protected — returns the authenticated user's profile
 */
router.get('/me', authenticate, getMe);

export default router;
