import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import type { RegisterDto, LoginDto } from '../middlewares/validation.middleware';

// ─────────────────────────────────────────────
//  Auth Controller
//  Thin layer: delegates to service, formats response.
// ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: >
 *       Creates a new user account. Returns a JWT access token upon
 *       successful registration so the client can authenticate immediately.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             client:
 *               summary: Register a gym client
 *               value:
 *                 email: john.doe@example.com
 *                 password: Str0ngP@ss1
 *                 name: John Doe
 *                 role: client
 *             admin:
 *               summary: Register an admin
 *               value:
 *                 email: admin@gymapp.io
 *                 password: Adm1nP@ss!
 *                 name: Gym Admin
 *                 role: admin
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *       '409':
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '422':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function register(
  req: Request<object, object, RegisterDto>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with email and password
 *     description: >
 *       Authenticates an existing user. Returns a JWT access token
 *       to be used in subsequent protected requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: john.doe@example.com
 *             password: Str0ngP@ss1
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '422':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function login(
  req: Request<object, object, LoginDto>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the current authenticated user
 *     description: >
 *       Returns the profile of the currently authenticated user,
 *       derived from the JWT token. Password is never returned.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserResponse'
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // req.user is guaranteed by the authenticate middleware
    const user = await authService.getMe(req.user!.sub);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
