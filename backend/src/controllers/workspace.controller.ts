import { Request, Response, NextFunction } from 'express';
import { workspaceService } from '../services';
import { logger } from '../utils/logger';

export const workspaceController = {
  /**
   * Get client workspace (folder tree)
   */
  async getClientWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const workspace = await workspaceService.getClientWorkspace(clientId, userId, userRole);

      res.json({
        success: true,
        message: 'Workspace retrieved successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get folder contents
   */
  async getFolderContents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const contents = await workspaceService.getFolderContents(folderId, userId, userRole);

      res.json({
        success: true,
        message: 'Folder contents retrieved successfully',
        data: contents,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload file to folder
   */
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folderId } = req.body;
      const file = req.file;
      const uploaderId = req.user!.id;
      const ip = req.ip;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      if (!folderId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID is required',
        });
        return;
      }

      const result = await workspaceService.uploadFile(
        folderId,
        {
          originalname: file.originalname,
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        },
        uploaderId,
        ip
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get file download URL
   */
  async getFileDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const ip = req.ip;

      const result = await workspaceService.getFileDownloadUrl(fileId, userId, userRole, ip);

      res.json({
        success: true,
        message: 'Download URL generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete file
   */
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user!.id;
      const ip = req.ip;

      await workspaceService.deleteFile(fileId, userId, ip);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rename file
   */
  async renameFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const { name } = req.body;
      const userId = req.user!.id;
      const ip = req.ip;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'New file name is required',
        });
        return;
      }

      const result = await workspaceService.renameFile(fileId, name, userId, ip);

      res.json({
        success: true,
        message: 'File renamed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Move file to another folder
   */
  async moveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const { targetFolderId } = req.body;
      const userId = req.user!.id;
      const ip = req.ip;

      if (!targetFolderId) {
        res.status(400).json({
          success: false,
          message: 'Target folder ID is required',
        });
        return;
      }

      const result = await workspaceService.moveFile(fileId, targetFolderId, userId, ip);

      res.json({
        success: true,
        message: 'File moved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new folder
   */
  async createFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { parentFolderId, name } = req.body;
      const userId = req.user!.id;
      const ip = req.ip;

      if (!parentFolderId || !name) {
        res.status(400).json({
          success: false,
          message: 'Parent folder ID and name are required',
        });
        return;
      }

      const result = await workspaceService.createFolder(parentFolderId, name, userId, ip);

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete folder
   */
  async deleteFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = req.user!.id;
      const ip = req.ip;

      await workspaceService.deleteFolder(folderId, userId, ip);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rename folder
   */
  async renameFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folderId } = req.params;
      const { name } = req.body;
      const userId = req.user!.id;
      const ip = req.ip;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'New folder name is required',
        });
        return;
      }

      const result = await workspaceService.renameFolder(folderId, name, userId, ip);

      res.json({
        success: true,
        message: 'Folder renamed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add year folder to client
   */
  async addYearFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.params;
      const { year } = req.body;
      const userId = req.user!.id;
      const ip = req.ip;

      if (!year) {
        res.status(400).json({
          success: false,
          message: 'Year is required',
        });
        return;
      }

      const result = await workspaceService.addYearFolder(clientId, year, userId, ip);

      res.status(201).json({
        success: true,
        message: 'Year folder created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
