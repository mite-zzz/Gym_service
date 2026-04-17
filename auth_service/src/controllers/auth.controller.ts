import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import type { RegisterDto, LoginDto } from '../middlewares/validation.middleware';

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account and returns an access token (15 min) and a refresh token (30 days).
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
 *                 password: Adm1nP@ss1
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
 *     description: Returns an access token (15 min) and a refresh token (30 days). Use the access token in the Authorization header for protected requests. When it expires, call /auth/refresh with the refresh token.
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
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access token and a new refresh token. The old refresh token is invalidated after this call.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *           example:
 *             refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       '200':
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TokenPairResponse'
 *       '401':
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'refreshToken is required' } });
      return;
    }
    const tokens = await authService.refresh(refreshToken);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout — invalidate refresh token
 *     description: Clears the stored refresh token for the current user. After this call the refresh token can no longer be used to obtain new access tokens.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: Logged out successfully
 *       '401':
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.logout(req.user!.sub);
    sendSuccess(res, { message: 'Logged out successfully' });
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
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user. Requires a valid access token in the Authorization header.
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
    const user = await authService.getMe(req.user!.sub);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
