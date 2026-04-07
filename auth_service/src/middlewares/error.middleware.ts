import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// ─────────────────────────────────────────────
//  Global Error Handling Middleware
// ─────────────────────────────────────────────

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
    stack?: string;
  };
}

/**
 * Converts known Prisma errors to structured AppErrors.
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation
      const fields = (err.meta?.target as string[]) ?? ['field'];
      return AppError.conflict(
        `A record with this ${fields.join(', ')} already exists.`,
      );
    }
    case 'P2025':
      return AppError.notFound('Record');
    case 'P2003':
      return AppError.badRequest('Related record not found (foreign key constraint).');
    default:
      logger.error('Unhandled Prisma error', { code: err.code, meta: err.meta });
      return AppError.internal();
  }
}

/**
 * Express global error handler.
 * Must be registered LAST, after all routes.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ── Normalize to AppError ──────────────────
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    appError = AppError.badRequest('Invalid data supplied to the database.');
  } else if (err instanceof SyntaxError && 'body' in err) {
    // Malformed JSON body
    appError = AppError.badRequest('Malformed JSON in request body.');
  } else {
    // Unknown / unexpected error
    logger.error('Unexpected error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    appError = AppError.internal();
  }

  // ── Log operational errors at warn, programmer errors at error ──
  if (appError.isOperational) {
    logger.warn('Operational error', {
      code: appError.code,
      statusCode: appError.statusCode,
      message: appError.message,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Non-operational error', {
      message: appError.message,
      stack: appError.stack,
    });
  }

  // ── Build response ─────────────────────────
  const body: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      ...(env.NODE_ENV === 'development' ? { stack: appError.stack } : {}),
    },
  };

  res.status(appError.statusCode).json(body);
}

/**
 * 404 handler — catches requests to undefined routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl}`));
}
