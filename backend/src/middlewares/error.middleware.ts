import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, InternalServerError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known application errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    // Include stack trace in development
    if (config.nodeEnv === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const sequelizeError = err as any;
    const errors: Record<string, string[]> = {};

    if (sequelizeError.errors) {
      sequelizeError.errors.forEach((e: any) => {
        const field = e.path || 'unknown';
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(e.message);
      });
    }

    res.status(422).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      errors,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  // Handle unknown errors
  const response: any = {
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
};

/**
 * Async wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
