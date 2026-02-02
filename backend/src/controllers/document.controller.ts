import { Request, Response } from 'express';
import { documentService } from '../services';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middlewares';
import { BadRequestError } from '../utils/errors';

/**
 * Upload a document
 * POST /documents/upload
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const { yearId } = req.body;
  if (!yearId) {
    throw new BadRequestError('Year ID is required');
  }

  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const result = await documentService.upload(
    yearId,
    {
      originalname: req.file.originalname,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
    userId,
    ip
  );

  sendCreated(res, result, 'Document uploaded successfully');
});

/**
 * Get documents by year
 * GET /documents/year/:yearId
 */
export const getDocumentsByYear = asyncHandler(async (req: Request, res: Response) => {
  const documents = await documentService.getByYearId(req.params.yearId);
  sendSuccess(res, documents);
});

/**
 * Get document download URL
 * GET /documents/:id/download
 */
export const getDownloadUrl = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const ip = req.ip || req.socket.remoteAddress;

  const result = await documentService.getDownloadUrl(req.params.id, userId, userRole, ip);
  sendSuccess(res, result);
});

/**
 * Delete a document
 * DELETE /documents/:id
 */
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  await documentService.delete(req.params.id, userId, ip);
  sendNoContent(res);
});

/**
 * Get all documents (admin only)
 * GET /documents
 */
export const getAllDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { yearId, search, mimeType, page = 1, limit = 10, sortBy, sortOrder = 'desc' } = req.query;

  const { documents, total } = await documentService.getAll(
    {
      yearId: yearId as string,
      search: search as string,
      mimeType: mimeType as string,
    },
    {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    }
  );

  sendPaginated(res, documents, Number(page), Number(limit), total);
});

/**
 * Get storage statistics
 * GET /documents/stats
 */
export const getStorageStats = asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.query;
  const stats = await documentService.getStorageStats(clientId as string);
  sendSuccess(res, stats);
});
