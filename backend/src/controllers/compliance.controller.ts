import { Request, Response, NextFunction } from 'express';
import { complianceService } from '../services/compliance.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { logger } from '../utils/logger';

export const complianceController = {
  // ========== DEADLINES ==========

  async getDeadlines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, month, year, startDate, endDate } = req.query;
      const deadlines = await complianceService.getDeadlines({
        type: type as string,
        month: month ? parseInt(month as string, 10) : undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendSuccess(res, deadlines, 'Deadlines retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deadline = await complianceService.getDeadline(req.params.deadlineId);
      sendSuccess(res, deadline, 'Deadline retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, title, dueDate, recurring, recurringPattern, description } = req.body;
      const deadline = await complianceService.createDeadline({
        type,
        title,
        dueDate,
        recurring: recurring || false,
        recurringPattern,
        description,
      });
      sendCreated(res, deadline, 'Deadline created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deadline = await complianceService.updateDeadline(req.params.deadlineId, req.body);
      sendSuccess(res, deadline, 'Deadline updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await complianceService.deleteDeadline(req.params.deadlineId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },

  // ========== CLIENT ASSIGNMENTS ==========

  async assignClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, notes } = req.body;
      const result = await complianceService.assignClient(req.params.deadlineId, clientId, notes);
      sendCreated(res, result, 'Client assigned to deadline successfully');
    } catch (error) {
      next(error);
    }
  },

  async bulkAssignClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientIds } = req.body;
      const result = await complianceService.bulkAssignClients(req.params.deadlineId, clientIds);
      sendCreated(res, result, `${result.length} clients assigned to deadline`);
    } catch (error) {
      next(error);
    }
  },

  async updateClientDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, filedDate, notes } = req.body;
      const result = await complianceService.updateClientDeadline(req.params.clientDeadlineId, {
        status,
        filedDate,
        notes,
      });
      sendSuccess(res, result, 'Client deadline updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async removeClientDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await complianceService.removeClientDeadline(req.params.clientDeadlineId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },

  async getClientDeadlines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, deadlineId, status, startDate, endDate } = req.query;
      const result = await complianceService.getClientDeadlines({
        clientId: clientId as string,
        deadlineId: deadlineId as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendSuccess(res, result, 'Client deadlines retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  // ========== STATS & WIDGETS ==========

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year } = req.query;
      const stats = await complianceService.getStats(year ? parseInt(year as string, 10) : undefined);
      sendSuccess(res, stats, 'Compliance stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getUpcomingThisWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await complianceService.getUpcomingThisWeek();
      sendSuccess(res, result, 'Upcoming deadlines retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getOverdue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await complianceService.getOverdueDeadlines();
      sendSuccess(res, result, 'Overdue deadlines retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
