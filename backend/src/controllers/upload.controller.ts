import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { sendSuccess, sendCreated } from '../utils/response';

export const uploadController = {
  /**
   * Generate upload link for a checklist
   * POST /api/v1/checklists/:checklistId/generate-link
   */
  async generateUploadLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checklistId } = req.params;
      const userId = (req as any).user.userId;

      const result = await uploadService.generateUploadToken(checklistId, userId, req.ip);

      sendCreated(res, result, 'Upload link generated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get checklist data via upload token (public - no auth needed)
   * GET /api/v1/upload/:token
   */
  async getUploadPageData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const data = await uploadService.validateUploadToken(token);

      sendSuccess(res, data, 'Upload page data retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload file via token (public - no auth needed)
   * POST /api/v1/upload/:token
   */
  async uploadViaToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { itemId } = req.body;

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      if (!itemId) {
        res.status(400).json({ success: false, message: 'itemId is required' });
        return;
      }

      const result = await uploadService.uploadViaToken(token, itemId, {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      sendSuccess(res, result, 'File uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload file via admin (authenticated)
   * POST /api/v1/checklists/:checklistId/items/:itemId/upload
   */
  async uploadViaAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checklistId, itemId } = req.params;
      const userId = (req as any).user.userId;

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const result = await uploadService.uploadViaAdmin(
        checklistId,
        itemId,
        {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        userId,
        req.ip
      );

      sendSuccess(res, result, 'File uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Download single checklist item file
   * GET /api/v1/checklists/:checklistId/download/:itemId
   */
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checklistId, itemId } = req.params;
      const userId = (req as any).user.userId;

      const { url, fileName } = await uploadService.downloadChecklistFile(
        checklistId,
        itemId,
        userId,
        req.ip
      );

      sendSuccess(res, { url, fileName }, 'Download URL generated');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Download all checklist files as ZIP
   * GET /api/v1/checklists/:checklistId/download-all
   */
  async downloadAllAsZip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checklistId } = req.params;
      const userId = (req as any).user.userId;

      const { stream, fileName } = await uploadService.downloadChecklistZip(
        checklistId,
        userId,
        req.ip
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update item status (verify/reject)
   * PATCH /api/v1/checklists/:checklistId/items/:itemId/status
   */
  async updateItemStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { checklistId, itemId } = req.params;
      const { status, rejectionReason } = req.body;
      const userId = (req as any).user.userId;

      if (!['verified', 'rejected', 'pending'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status must be verified, rejected, or pending' });
        return;
      }

      const result = await uploadService.updateItemStatus(
        checklistId,
        itemId,
        status,
        userId,
        rejectionReason,
        req.ip
      );

      sendSuccess(res, result, `Item ${status} successfully`);
    } catch (error) {
      next(error);
    }
  },
};
