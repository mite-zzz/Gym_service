import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

const authLimiter = rateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
