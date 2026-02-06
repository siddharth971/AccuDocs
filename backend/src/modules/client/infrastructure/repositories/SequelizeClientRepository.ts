import { injectable } from "tsyringe";
import { IClientRepository } from "../../domain/repositories/IClientRepository";
import { Client } from "../../domain/entities/Client";
import { Client as ClientModel } from "../../../../models/client.model";
import { User, Year } from "../../../../models";
import { ClientMapper } from "../mappers/ClientMapper";
import { Op } from "sequelize";

@injectable()
export class SequelizeClientRepository implements IClientRepository {
  async save(client: Client, options?: any): Promise<void> {
    const raw = ClientMapper.toPersistence(client);
    const exists = await ClientModel.findByPk(client.id);
    if (exists) {
      await exists.update(raw, options);
    } else {
      await ClientModel.create(raw, options);
    }
  }

  async findById(id: string): Promise<Client | null> {
    const client = await ClientModel.findByPk(id);
    if (!client) return null;
    return ClientMapper.toDomain(client);
  }

  async findByCode(code: string): Promise<Client | null> {
    const client = await ClientModel.findOne({ where: { code } });
    if (!client) return null;
    return ClientMapper.toDomain(client);
  }

  async findByUserId(userId: string): Promise<Client | null> {
    const client = await ClientModel.findOne({ where: { userId } });
    if (!client) return null;
    return ClientMapper.toDomain(client);
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const where: any = { code };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await ClientModel.count({ where });
    return count > 0;
  }

  async getNextCode(): Promise<string> {
    const lastClient = await ClientModel.findOne({
      order: [['code', 'desc']],
    });

    if (!lastClient) {
      return '01';
    }

    const lastCode = parseInt(lastClient.code, 10);
    return String(lastCode + 1).padStart(2, '0');
  }

  async delete(id: string, options?: any): Promise<void> {
    await ClientModel.destroy({ where: { id }, ...options });
  }

  async findAll(
    filters: { search?: string } = {},
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = { page: 1, limit: 10 }
  ): Promise<{ clients: any[]; total: number }> {
    const where: any = {};
    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    if (filters.search) {
      const matchedUsers = await User.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${filters.search}%` } },
            { mobile: { [Op.like]: `%${filters.search}%` } },
          ],
        },
      });
      const matchedUserIds = matchedUsers.map((u: any) => u.id);

      where[Op.or] = [
        { code: { [Op.like]: `%${filters.search}%` } },
        { userId: { [Op.in]: matchedUserIds } }
      ];
    }

    const { rows: clients, count: total } = await ClientModel.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'mobile', 'isActive'] },
        { model: Year, as: 'years' },
      ],
      offset,
      limit: pagination.limit,
      order,
      distinct: true,
    });

    return { clients, total };
  }
}
