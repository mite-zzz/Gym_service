import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

// ─────────────────────────────────────────────
//  JWT Utilities
// ─────────────────────────────────────────────

export interface JwtPayload {
  sub: string;      // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT token with the user's identity claims.
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'gym-auth-service',
    audience: 'gym-app',
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes a JWT token.
 * Throws an AppError for any verification failure.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'gym-auth-service',
      audience: 'gym-app',
    }) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Token has expired. Please log in again.');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid token. Please log in again.');
    }
    throw AppError.unauthorized();
  }
}

/**
 * Extracts a Bearer token from an Authorization header value.
 * Returns null if the header is missing or malformed.
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
