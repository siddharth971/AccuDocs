import { Request, Response } from 'express';
import { logService } from '../services';
import { sendSuccess, sendPaginated } from '../utils/response';
import { asyncHandler } from '../middlewares';
import { LogAction } from '../models';

/**
 * Get logs with filtering and pagination
 * GET /logs
 */
export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    action,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
    sortBy,
    sortOrder = 'desc'
  } = req.query;

  const { logs, total } = await logService.getLogs(
    {
      userId: userId as string,
      action: action as LogAction,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
    },
    {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    }
  );

  sendPaginated(res, logs, Number(page), Number(limit), total);
});

/**
 * Get current user's logs
 * GET /logs/me
 */
export const getMyLogs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const limit = Number(req.query.limit) || 50;

  const logs = await logService.getUserLogs(userId, limit);
  sendSuccess(res, logs);
});

/**
 * Get log statistics
 * GET /logs/stats
 */
export const getLogStats = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30;
  const stats = await logService.getStats(days);
  sendSuccess(res, stats);
});

/**
 * Cleanup old logs
 * DELETE /logs/cleanup
 */
export const cleanupLogs = asyncHandler(async (req: Request, res: Response) => {
  const retentionDays = Number(req.query.retentionDays) || 90;
  const deletedCount = await logService.cleanupOldLogs(retentionDays);
  sendSuccess(res, { deletedCount }, `${deletedCount} old logs cleaned up`);
});
