import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/audit-log.model';
import { logger } from '../utils/logger';

/**
 * Immutable Audit Logger Middleware
 * Automatically captures mutating requests and logs them asynchronously
 */
export const auditLogger = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only trace mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Capture the original send to monkey patch the response and observe changes
      const originalSend = res.send;
      res.send = function (body) {
        // Fire & Forget asynchronously to not block the response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logActionAsync(req, res, body).catch(e => {
            logger.error(`Failed to register audit log: ${e.message}`);
          });
        }
        return originalSend.apply(res, arguments as any);
      };
    }
    next();
  };
};

async function logActionAsync(req: Request, res: Response, resBody: any) {
  const user = req.user;
  const orgId = user?.organizationId || res.locals?.organizationId || req.body?.organizationId;
  const entityType = determineEntityType(req.path);

  // Try mapping the created/modified entity ID from the body natively
  let entityId = '(unknown)';
  try {
    const parsedBody = JSON.parse(resBody);
    if (parsedBody.data && parsedBody.data.id) {
      entityId = parsedBody.data.id;
    }
  } catch (e) { }

  if (!orgId || entityType === 'UNKNOWN') return;

  const changesObj = {
    path: req.path,
    method: req.method,
    body: redactSensitiveInfo(req.body),
    query: req.query
  };

  await AuditLog.create({
    organizationId: orgId,
    entityType: entityType as any,
    entityId: entityId,
    action: req.method === 'POST' ? 'CREATE' : req.method === 'DELETE' ? 'DELETE' : 'UPDATE',
    changes: changesObj,
    performedBy: user?.userId,
    ipAddress: req.ip || req.connection.remoteAddress,
  });
}

function determineEntityType(path: string): string {
  if (path.includes('/invoice')) return 'INVOICE';
  if (path.includes('/payment')) return 'PAYMENT';
  if (path.includes('/credit-note')) return 'CREDIT_NOTE';
  if (path.includes('/client')) return 'CLIENT';
  if (path.includes('/organization')) return 'ORGANIZATION';
  if (path.includes('/branch')) return 'BRANCH';
  return 'UNKNOWN';
}

function redactSensitiveInfo(obj: any): any {
  if (!obj) return obj;
  const clone = { ...obj };

  // Pan / Card masking
  const sensitiveKeys = ['password', 'mfaSecret', 'creditCard', 'panNumber'];
  for (const key of sensitiveKeys) {
    if (clone[key]) clone[key] = '***REDACTED***';
  }

  return clone;
}
