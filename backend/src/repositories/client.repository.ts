import { Client, ClientAttributes, ClientCreationAttributes, User, Year } from '../models';
import { Op } from 'sequelize';

export interface ClientFilters {
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientRepository = {
  async findById(id: string): Promise<Client | null> {
    return Client.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'mobile', 'isActive'] },
        { model: Year, as: 'years' },
      ],
    });
  },

  async findByCode(code: string): Promise<Client | null> {
    return Client.findOne({
      where: { code },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'mobile', 'isActive'] },
        { model: Year, as: 'years' },
      ],
    });
  },

  async findByUserId(userId: string): Promise<Client | null> {
    return Client.findOne({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'mobile', 'isActive'] },
        { model: Year, as: 'years' },
      ],
    });
  },

  async create(data: ClientCreationAttributes): Promise<Client> {
    return Client.create(data);
  },

  async update(id: string, data: Partial<ClientAttributes>): Promise<Client | null> {
    const client = await Client.findByPk(id);
    if (!client) return null;
    await client.update(data);
    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await Client.destroy({ where: { id } });
    return deleted > 0;
  },

  async findAll(
    filters: ClientFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<{ clients: Client[]; total: number }> {
    const where: any = {};

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    const includeOptions: any = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'mobile', 'isActive'],
        ...(filters.search && {
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${filters.search}%` } },
              { mobile: { [Op.like]: `%${filters.search}%` } },
            ],
          },
        }),
      },
    ];

    if (filters.search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const { rows: clients, count: total } = await Client.findAndCountAll({
      where,
      include: includeOptions,
      offset,
      limit: pagination.limit,
      order,
      distinct: true,
    });

    return { clients, total };
  },

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await Client.count({ where });
    return count > 0;
  },

  async getNextCode(): Promise<string> {
    const lastClient = await Client.findOne({
      order: [['code', 'desc']],
    });

    if (!lastClient) {
      return '01';
    }

    const lastCode = parseInt(lastClient.code, 10);
    return String(lastCode + 1).padStart(2, '0');
  },
};
