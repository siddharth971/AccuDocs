import { Checklist, ChecklistTemplate, Client, User } from '../models';
import { Op } from 'sequelize';

export interface ChecklistFilters {
  clientId?: string;
  financialYear?: string;
  serviceType?: string;
  status?: string;
  search?: string;
}

export interface ChecklistPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const checklistRepository = {
  // ========== CHECKLIST ==========

  async findById(id: string): Promise<Checklist | null> {
    return Checklist.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'mobile'] }],
        },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: ChecklistTemplate, as: 'template', attributes: ['id', 'name', 'serviceType'] },
      ],
    });
  },

  async findAll(
    filters: ChecklistFilters = {},
    pagination: ChecklistPagination = { page: 1, limit: 10 }
  ): Promise<{ checklists: Checklist[]; total: number }> {
    const where: any = {};

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.financialYear) where.financialYear = filters.financialYear;
    if (filters.serviceType) where.serviceType = filters.serviceType;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.name = { [Op.like]: `%${filters.search}%` };
    }

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    const { rows: checklists, count: total } = await Checklist.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'mobile'] }],
        },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
      ],
      offset,
      limit: pagination.limit,
      order,
      distinct: true,
    });

    return { checklists, total };
  },

  async findByClientId(clientId: string): Promise<Checklist[]> {
    return Checklist.findAll({
      where: { clientId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'desc']],
    });
  },

  async create(data: any): Promise<Checklist> {
    return Checklist.create(data) as unknown as Promise<Checklist>;
  },

  async update(id: string, data: any): Promise<Checklist | null> {
    const checklist = await Checklist.findByPk(id);
    if (!checklist) return null;
    await checklist.update(data);
    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await Checklist.destroy({ where: { id } });
    return deleted > 0;
  },

  async getStats(clientId?: string): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    avgProgress: number;
  }> {
    const where: any = {};
    if (clientId) where.clientId = clientId;

    const total = await Checklist.count({ where });
    const active = await Checklist.count({ where: { ...where, status: 'active' } });
    const completed = await Checklist.count({ where: { ...where, status: 'completed' } });
    const overdue = await Checklist.count({
      where: {
        ...where,
        status: 'active',
        dueDate: { [Op.lt]: new Date() },
      },
    });

    // Calculate average progress
    const allChecklists = await Checklist.findAll({
      where: { ...where, status: 'active' },
      attributes: ['progress'],
    });
    const avgProgress = allChecklists.length > 0
      ? allChecklists.reduce((sum, c) => sum + c.progress, 0) / allChecklists.length
      : 0;

    return { total, active, completed, overdue, avgProgress: Math.round(avgProgress * 100) / 100 };
  },

  // ========== TEMPLATES ==========

  async findTemplateById(id: string): Promise<ChecklistTemplate | null> {
    return ChecklistTemplate.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    });
  },

  async findAllTemplates(): Promise<ChecklistTemplate[]> {
    return ChecklistTemplate.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['isDefault', 'DESC'], ['name', 'ASC']],
    });
  },

  async createTemplate(data: any): Promise<ChecklistTemplate> {
    return ChecklistTemplate.create(data) as unknown as Promise<ChecklistTemplate>;
  },

  async updateTemplate(id: string, data: any): Promise<ChecklistTemplate | null> {
    const template = await ChecklistTemplate.findByPk(id);
    if (!template) return null;
    await template.update(data);
    return this.findTemplateById(id);
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = await ChecklistTemplate.destroy({ where: { id } });
    return deleted > 0;
  },
};
