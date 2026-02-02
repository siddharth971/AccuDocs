import { Document, DocumentAttributes, DocumentCreationAttributes, Year, User } from '../models';
import { Op } from 'sequelize';

export interface DocumentFilters {
  yearId?: string;
  search?: string;
  mimeType?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const documentRepository = {
  async findById(id: string): Promise<Document | null> {
    return Document.findByPk(id, {
      include: [
        { model: Year, as: 'year' },
        { model: User, as: 'uploader', attributes: ['id', 'name'] },
      ],
    });
  },

  async findByYearId(yearId: string): Promise<Document[]> {
    return Document.findAll({
      where: { yearId },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
      order: [['createdAt', 'desc']],
    });
  },

  async create(data: DocumentCreationAttributes): Promise<Document> {
    return Document.create(data);
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await Document.destroy({ where: { id } });
    return deleted > 0;
  },

  async findAll(
    filters: DocumentFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<{ documents: Document[]; total: number }> {
    const where: any = {};

    if (filters.yearId) {
      where.yearId = filters.yearId;
    }

    if (filters.search) {
      where[Op.or] = [
        { fileName: { [Op.like]: `%${filters.search}%` } },
        { originalName: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    if (filters.mimeType) {
      where.mimeType = { [Op.like]: `%${filters.mimeType}%` };
    }

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    const { rows: documents, count: total } = await Document.findAndCountAll({
      where,
      include: [
        { model: Year, as: 'year' },
        { model: User, as: 'uploader', attributes: ['id', 'name'] },
      ],
      offset,
      limit: pagination.limit,
      order,
    });

    return { documents, total };
  },

  async existsByYearAndFileName(yearId: string, fileName: string): Promise<boolean> {
    const count = await Document.count({ where: { yearId, fileName } });
    return count > 0;
  },

  async getTotalSize(yearId?: string): Promise<number> {
    const where = yearId ? { yearId } : {};
    const result = await Document.sum('size', { where });
    return result || 0;
  },

  async countByYear(yearId: string): Promise<number> {
    return Document.count({ where: { yearId } });
  },

  async findByS3Path(s3Path: string): Promise<Document | null> {
    return Document.findOne({ where: { s3Path } });
  },
};
