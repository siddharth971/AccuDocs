import { File, FileCreationAttributes, Folder, User } from '../models';
import { Op } from 'sequelize';

interface FileFilters {
  folderId?: string;
  search?: string;
  mimeType?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FileWithDetails extends File {
  folder?: Folder;
  uploader?: User;
}

export const fileRepository = {
  /**
   * Create a new file
   */
  async create(data: FileCreationAttributes): Promise<File> {
    return File.create(data);
  },

  /**
   * Find file by ID
   */
  async findById(id: string): Promise<FileWithDetails | null> {
    const file = await File.findOne({
      where: { id },
      include: [
        {
          model: Folder,
          as: 'folder',
          required: false // Keep allow null for safety
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name'],
        },
      ],
    });
    // @ts-ignore
    return file;
  },

  /**
   * Find files by folder ID
   */
  async findByFolderId(folderId: string): Promise<File[]> {
    return File.findAll({
      where: { folderId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Find files with filters and pagination
   */
  async findAll(
    filters: FileFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<{ files: File[]; total: number }> {
    const where: any = {};

    if (filters.folderId) {
      where.folderId = filters.folderId;
    }

    if (filters.search) {
      where[Op.or] = [
        { originalName: { [Op.like]: `%${filters.search}%` } },
        { fileName: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.mimeType) {
      where.mimeType = { [Op.like]: `%${filters.mimeType}%` };
    }

    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    const { rows: files, count: total } = await File.findAndCountAll({
      where,
      include: [
        {
          model: Folder,
          as: 'folder',
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name'],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    return { files, total };
  },

  /**
   * Update a file
   */
  async update(id: string, data: Partial<FileCreationAttributes>): Promise<void> {
    await File.update(data, { where: { id } });
  },

  /**
   * Delete a file
   */
  async delete(id: string): Promise<void> {
    await File.destroy({ where: { id } });
  },

  /**
   * Delete all files in a folder
   */
  async deleteByFolderId(folderId: string): Promise<void> {
    await File.destroy({ where: { folderId } });
  },

  /**
   * Check if file exists in folder by name
   */
  async existsByNameInFolder(originalName: string, folderId: string, excludeId?: string): Promise<boolean> {
    const where: any = { originalName, folderId };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await File.count({ where });
    return count > 0;
  },

  /**
   * Get total size of files in a folder
   */
  async getTotalSizeByFolderId(folderId: string): Promise<number> {
    const result = await File.sum('size', { where: { folderId } });
    return result || 0;
  },

  /**
   * Count files in a folder
   */
  async countByFolderId(folderId: string): Promise<number> {
    return File.count({ where: { folderId } });
  },

  /**
   * Move file to another folder
   */
  async moveToFolder(id: string, newFolderId: string, newS3Path: string): Promise<void> {
    await File.update({ folderId: newFolderId, s3Path: newS3Path }, { where: { id } });
  },

  /**
   * Rename file
   */
  async rename(id: string, newOriginalName: string): Promise<void> {
    await File.update({ originalName: newOriginalName }, { where: { id } });
  },
};
