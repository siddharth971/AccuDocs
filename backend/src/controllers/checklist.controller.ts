import { Request, Response, NextFunction } from 'express';
import { checklistService } from '../services/checklist.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { logger } from '../utils/logger';

export const checklistController = {
  // ========== TEMPLATES ==========

  async getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await checklistService.getTemplates();
      sendSuccess(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await checklistService.getTemplate(req.params.templateId);
      sendSuccess(res, template, 'Template retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, serviceType, description, items } = req.body;
      const template = await checklistService.createTemplate({
        name,
        serviceType,
        description,
        items: items || [],
        createdBy: (req as any).user.id,
      });
      sendCreated(res, template, 'Template created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await checklistService.updateTemplate(req.params.templateId, req.body);
      sendSuccess(res, template, 'Template updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await checklistService.deleteTemplate(req.params.templateId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },

  // ========== CHECKLISTS ==========

  async getChecklists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', clientId, financialYear, serviceType, status, search } = req.query;

      const filters: any = {};
      if (clientId) filters.clientId = clientId;
      if (financialYear) filters.financialYear = financialYear;
      if (serviceType) filters.serviceType = serviceType;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const pagination = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const { checklists, total } = await checklistService.getChecklists(filters, pagination);
      sendPaginated(res, checklists, pagination.page, pagination.limit, total, 'Checklists retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklist = await checklistService.getChecklist(req.params.checklistId);
      sendSuccess(res, checklist, 'Checklist retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getClientChecklists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklists = await checklistService.getClientChecklists(req.params.clientId);
      sendSuccess(res, checklists, 'Client checklists retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, templateId, name, financialYear, serviceType, dueDate, notes } = req.body;
      const checklist = await checklistService.createChecklist({
        clientId,
        templateId,
        name,
        financialYear,
        serviceType,
        dueDate,
        notes,
        createdBy: (req as any).user.userId,
        ip: req.ip,
      });
      sendCreated(res, checklist, 'Checklist created successfully');
    } catch (error) {
      next(error);
    }
  },

  async bulkCreateChecklists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { templateId, clientIds, financialYear, dueDate, sendWhatsApp } = req.body;

      if (!templateId || !financialYear) {
        res.status(400).json({ success: false, message: 'templateId and financialYear are required' });
        return;
      }

      const result = await checklistService.bulkCreateChecklists({
        templateId,
        clientIds: clientIds || 'all',
        financialYear,
        dueDate,
        sendWhatsApp: !!sendWhatsApp,
        createdBy: (req as any).user.userId,
        ip: req.ip,
      });

      sendSuccess(res, result, `Created ${result.created} checklists. Skipped ${result.skipped} (already exist).`);
    } catch (error) {
      next(error);
    }
  },

  async updateChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklist = await checklistService.updateChecklist(
        req.params.checklistId,
        req.body,
        (req as any).user.id,
        req.ip
      );
      sendSuccess(res, checklist, 'Checklist updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async sendReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await checklistService.sendReminder(req.params.checklistId, (req as any).user.id);
      sendSuccess(res, null, 'Reminder sent successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await checklistService.deleteChecklist(req.params.checklistId, (req as any).user.id, req.ip);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },

  // ========== CHECKLIST ITEMS ==========

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { label, description, category, required } = req.body;
      const checklist = await checklistService.addItem(
        req.params.checklistId,
        { label, description, category, required },
        (req as any).user.id
      );
      sendSuccess(res, checklist, 'Item added successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, fileId, fileName, rejectionReason, notes } = req.body;
      const checklist = await checklistService.updateItemStatus(
        req.params.checklistId,
        req.params.itemId,
        status,
        { fileId, fileName, rejectionReason, notes },
        (req as any).user.id,
        req.ip
      );
      sendSuccess(res, checklist, 'Item status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async bulkUpdateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { updates } = req.body;
      const checklist = await checklistService.bulkUpdateItemStatus(
        req.params.checklistId,
        updates,
        (req as any).user.id,
        req.ip
      );
      sendSuccess(res, checklist, 'Items updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklist = await checklistService.removeItem(
        req.params.checklistId,
        req.params.itemId,
        (req as any).user.id
      );
      sendSuccess(res, checklist, 'Item removed successfully');
    } catch (error) {
      next(error);
    }
  },

  // ========== STATS ==========

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.query;
      const stats = await checklistService.getStats(clientId as string);
      sendSuccess(res, stats, 'Checklist stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPendingDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.query;
      const pending = await checklistService.getPendingDocumentsSummary(clientId as string);
      sendSuccess(res, pending, 'Pending documents retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
