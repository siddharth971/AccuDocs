import { logRepository } from '../repositories';
import { Log, LogAction } from '../models';

export interface LogResponse {
  id: string;
  action: LogAction;
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: object;
  user?: {
    id: string;
    name: string;
    mobile: string;
  };
  createdAt: Date;
}

export interface LogStats {
  totalLogs: number;
  actionCounts: Record<string, number>;
  recentActivity: LogResponse[];
}

export const logService = {
  /**
   * Get logs with filtering and pagination
   */
  async getLogs(
    filters: {
      userId?: string;
      action?: LogAction;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {},
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = { page: 1, limit: 10 }
  ): Promise<{ logs: LogResponse[]; total: number }> {
    const { logs, total } = await logRepository.findAll(filters, pagination);

    return {
      logs: logs.map((log) => this.formatLogResponse(log)),
      total,
    };
  },

  /**
   * Get logs for a specific user
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<LogResponse[]> {
    const logs = await logRepository.findByUserId(userId, limit);
    return logs.map((log) => this.formatLogResponse(log));
  },

  /**
   * Get log statistics
   */
  async getStats(days: number = 30): Promise<LogStats> {
    const actionCounts = await logRepository.getActionStats(days);
    const recentActivity = await logRepository.getRecentActivity(10);

    const totalLogs = Object.values(actionCounts).reduce((sum, count) => sum + count, 0);

    return {
      totalLogs,
      actionCounts,
      recentActivity: recentActivity.map((log) => this.formatLogResponse(log)),
    };
  },

  /**
   * Create a log entry
   */
  async createLog(
    action: LogAction,
    description: string,
    options: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      metadata?: object;
    } = {}
  ): Promise<LogResponse> {
    const log = await logRepository.create({
      action,
      description,
      ...options,
    });

    return this.formatLogResponse(log);
  },

  /**
   * Cleanup old logs
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    return logRepository.cleanupOld(retentionDays);
  },

  /**
   * Format log response
   */
  formatLogResponse(log: Log): LogResponse {
    const user = (log as any).user;

    return {
      id: log.id,
      action: log.action,
      description: log.description,
      ip: log.ip,
      userAgent: log.userAgent,
      metadata: log.metadata,
      user: user
        ? {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
        }
        : undefined,
      createdAt: log.createdAt,
    };
  },
};
