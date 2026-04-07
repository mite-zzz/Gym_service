import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractBearerToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';

// ─────────────────────────────────────────────
//  JWT Authentication Middleware
// ─────────────────────────────────────────────

// Augment the Express Request type to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Protects a route by requiring a valid JWT Bearer token.
 * On success, attaches the decoded payload to `req.user`.
 * On failure, passes a 401 AppError to the error handler.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(
      AppError.unauthorized(
        'No authentication token provided. Include a Bearer token in the Authorization header.',
      ),
    );
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-based access control guard.
 * Must be used AFTER `authenticate`.
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Role "${req.user.role}" is not permitted to access this resource.`,
        ),
      );
    }

    next();
  };
}
