import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../models';

/**
 * Role-based access control middleware
 * Restricts access to specified roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = requireRole('admin');

/**
 * Client only middleware
 */
export const clientOnly = requireRole('client');

/**
 * Admin or client middleware
 */
export const authenticated = requireRole('admin', 'client');
