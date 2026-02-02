import { Log, LogCreationAttributes, LogAction, User } from '../models';
import { Op } from 'sequelize';

export interface LogFilters {
  userId?: string;
  action?: LogAction;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const logRepository = {
  async create(data: LogCreationAttributes): Promise<Log> {
    return Log.create(data);
  },

  async findAll(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<{ logs: Log[]; total: number }> {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt[Op.lte] = filters.endDate;
      }
    }

    if (filters.search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${filters.search}%` } },
        { ip: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    const { rows: logs, count: total } = await Log.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'mobile'] }],
      offset,
      limit: pagination.limit,
      order,
    });

    return { logs, total };
  },

  async findByUserId(userId: string, limit: number = 50): Promise<Log[]> {
    return Log.findAll({
      where: { userId },
      order: [['createdAt', 'desc']],
      limit,
    });
  },

  async getActionStats(days: number = 30): Promise<Record<string, number>> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs = await Log.findAll({
      where: {
        createdAt: { [Op.gte]: since },
      },
      attributes: ['action'],
    });

    const stats: Record<string, number> = {};
    logs.forEach((log) => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });

    return stats;
  },

  async getRecentActivity(limit: number = 10): Promise<Log[]> {
    return Log.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'desc']],
      limit,
    });
  },

  async cleanupOld(days: number = 90): Promise<number> {
    const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await Log.destroy({
      where: {
        createdAt: { [Op.lt]: before },
      },
    });
    return deleted;
  },
};
