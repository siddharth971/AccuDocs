import { ComplianceDeadline, ComplianceDeadlineCreationAttributes, ClientDeadline, ClientDeadlineCreationAttributes, Client, User } from '../models';
import { Op } from 'sequelize';

export const complianceRepository = {
  // ========== COMPLIANCE DEADLINES ==========

  async findAllDeadlines(filters: {
    type?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ComplianceDeadline[]> {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate && filters.endDate) {
      where.dueDate = { [Op.between]: [filters.startDate, filters.endDate] };
    } else if (filters.month && filters.year) {
      const startDate = new Date(filters.year, filters.month - 1, 1);
      const endDate = new Date(filters.year, filters.month, 0);
      where.dueDate = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ],
      };
    } else if (filters.year) {
      where.dueDate = {
        [Op.between]: [`${filters.year}-01-01`, `${filters.year}-12-31`],
      };
    }

    return ComplianceDeadline.findAll({
      where,
      order: [['dueDate', 'ASC']],
    });
  },

  async findDeadlineById(id: string): Promise<ComplianceDeadline | null> {
    return ComplianceDeadline.findByPk(id, {
      include: [
        {
          model: ClientDeadline,
          as: 'clientDeadlines',
          include: [
            {
              model: Client,
              as: 'client',
              include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'mobile'] },
              ],
            },
          ],
        },
      ],
    });
  },

  async createDeadline(data: ComplianceDeadlineCreationAttributes): Promise<ComplianceDeadline> {
    return ComplianceDeadline.create(data) as unknown as Promise<ComplianceDeadline>;
  },

  async updateDeadline(id: string, data: Partial<ComplianceDeadlineCreationAttributes>): Promise<ComplianceDeadline | null> {
    const deadline = await ComplianceDeadline.findByPk(id);
    if (!deadline) return null;
    await deadline.update(data);
    return deadline;
  },

  async deleteDeadline(id: string): Promise<boolean> {
    // Also delete associated client deadlines
    await ClientDeadline.destroy({ where: { deadlineId: id } });
    const deleted = await ComplianceDeadline.destroy({ where: { id } });
    return deleted > 0;
  },

  async findSeededDeadlineByTitleAndDate(title: string, dueDate: string): Promise<ComplianceDeadline | null> {
    return ComplianceDeadline.findOne({
      where: { title, dueDate, isSeeded: true },
    });
  },

  async bulkCreateDeadlines(data: ComplianceDeadlineCreationAttributes[]): Promise<ComplianceDeadline[]> {
    return ComplianceDeadline.bulkCreate(data as any[], { ignoreDuplicates: true }) as unknown as Promise<ComplianceDeadline[]>;
  },

  // ========== CLIENT DEADLINES ==========

  async findClientDeadlines(filters: {
    clientId?: string;
    deadlineId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ClientDeadline[]> {
    const where: any = {};
    const deadlineWhere: any = {};

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.deadlineId) where.deadlineId = filters.deadlineId;
    if (filters.status) where.status = filters.status;

    if (filters.startDate && filters.endDate) {
      deadlineWhere.dueDate = { [Op.between]: [filters.startDate, filters.endDate] };
    }

    return ClientDeadline.findAll({
      where,
      include: [
        {
          model: ComplianceDeadline,
          as: 'deadline',
          where: Object.keys(deadlineWhere).length > 0 ? deadlineWhere : undefined,
        },
        {
          model: Client,
          as: 'client',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'mobile'] },
          ],
        },
      ],
      order: [[{ model: ComplianceDeadline, as: 'deadline' }, 'dueDate', 'ASC']],
    });
  },

  async findClientDeadlineById(id: string): Promise<ClientDeadline | null> {
    return ClientDeadline.findByPk(id, {
      include: [
        { model: ComplianceDeadline, as: 'deadline' },
        {
          model: Client,
          as: 'client',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'mobile'] },
          ],
        },
      ],
    });
  },

  async findClientDeadlineByClientAndDeadline(clientId: string, deadlineId: string): Promise<ClientDeadline | null> {
    return ClientDeadline.findOne({
      where: { clientId, deadlineId },
      include: [
        { model: ComplianceDeadline, as: 'deadline' },
      ],
    });
  },

  async createClientDeadline(data: ClientDeadlineCreationAttributes): Promise<ClientDeadline> {
    return ClientDeadline.create(data) as unknown as Promise<ClientDeadline>;
  },

  async bulkCreateClientDeadlines(data: ClientDeadlineCreationAttributes[]): Promise<ClientDeadline[]> {
    return ClientDeadline.bulkCreate(data as any[], { ignoreDuplicates: true }) as unknown as Promise<ClientDeadline[]>;
  },

  async updateClientDeadline(id: string, data: Partial<ClientDeadlineCreationAttributes>): Promise<ClientDeadline | null> {
    const cd = await ClientDeadline.findByPk(id);
    if (!cd) return null;
    await cd.update(data);
    return this.findClientDeadlineById(id);
  },

  async deleteClientDeadline(id: string): Promise<boolean> {
    const deleted = await ClientDeadline.destroy({ where: { id } });
    return deleted > 0;
  },

  // ========== STATS ==========

  async getStats(year?: number): Promise<{
    totalDeadlines: number;
    upcoming: number;
    overdue: number;
    filed: number;
    pending: number;
  }> {
    const now = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const deadlineWhere: any = {};
    if (year) {
      deadlineWhere.dueDate = { [Op.between]: [`${year}-01-01`, `${year}-12-31`] };
    }

    const totalDeadlines = await ComplianceDeadline.count({ where: deadlineWhere });

    const upcoming = await ClientDeadline.count({
      where: { status: 'pending' },
      include: [{
        model: ComplianceDeadline,
        as: 'deadline',
        where: {
          dueDate: { [Op.between]: [now, sevenDaysLater] },
          ...(year ? { dueDate: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } } : {}),
        },
      }],
    });

    const overdue = await ClientDeadline.count({ where: { status: 'overdue' } });
    const filed = await ClientDeadline.count({ where: { status: 'filed' } });
    const pending = await ClientDeadline.count({ where: { status: 'pending' } });

    return { totalDeadlines, upcoming, overdue, filed, pending };
  },

  async getUpcomingThisWeek(): Promise<ClientDeadline[]> {
    const now = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return ClientDeadline.findAll({
      where: {
        status: { [Op.in]: ['pending', 'overdue'] },
      },
      include: [
        {
          model: ComplianceDeadline,
          as: 'deadline',
          where: {
            dueDate: { [Op.between]: [now, sevenDaysLater] },
          },
        },
        {
          model: Client,
          as: 'client',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'mobile'] },
          ],
        },
      ],
      order: [[{ model: ComplianceDeadline, as: 'deadline' }, 'dueDate', 'ASC']],
      limit: 20,
    });
  },

  async getOverdueDeadlines(): Promise<ClientDeadline[]> {
    const now = new Date().toISOString().split('T')[0];

    return ClientDeadline.findAll({
      where: { status: { [Op.in]: ['pending', 'overdue'] } },
      include: [
        {
          model: ComplianceDeadline,
          as: 'deadline',
          where: {
            dueDate: { [Op.lt]: now },
          },
        },
        {
          model: Client,
          as: 'client',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'mobile'] },
          ],
        },
      ],
      order: [[{ model: ComplianceDeadline, as: 'deadline' }, 'dueDate', 'ASC']],
    });
  },
};
