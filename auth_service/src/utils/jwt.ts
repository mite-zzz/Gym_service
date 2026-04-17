import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'gym-auth-service',
    audience: 'gym-app',
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'gym-auth-service',
    audience: 'gym-app',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'gym-auth-service',
      audience: 'gym-app',
    }) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token has expired. Use refresh token to get a new one.');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid token. Please log in again.');
    }
    throw AppError.unauthorized();
  }
}

export function verifyRefreshToken(token: string): RefreshPayload {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
      issuer: 'gym-auth-service',
      audience: 'gym-app',
    }) as RefreshPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token has expired. Please log in again.');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid refresh token.');
    }
    throw AppError.unauthorized();
  }
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
