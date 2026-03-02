import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, DecodedToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { userRepository } from '../repositories';
import { UserRole } from '../models/user.model';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Verify user still exists and is active
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token exists, but doesn't require it
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = verifyAccessToken(token);
        if (decoded) {
          req.user = decoded;
        }
      }
    }

    next();
  } catch (error) {
    // Silently proceed without authentication
    next();
  }
};

/**
 * Role-Based Access Control Middleware
 * Requires the user to have one of the specified roles
 */
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        throw new UnauthorizedError('Authentication required to verify role');
      }

      const hasRole = roles.includes(req.user.role as UserRole);
      // Let 'super_admin' bypass every check
      if (!hasRole && req.user.role !== 'super_admin') {
        throw new ForbiddenError(`Access denied. Requires one of: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Enterprise Isolation Check
 * Ensures user is accessing data belonging to their own organization
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'super_admin' && !req.user.organizationId) {
      throw new ForbiddenError('User is not linked to any organization');
    }

    // Attach organizationId restriction logically
    res.locals.organizationId = req.user.organizationId;
    next();
  } catch (error) {
    next(error);
  }
};
