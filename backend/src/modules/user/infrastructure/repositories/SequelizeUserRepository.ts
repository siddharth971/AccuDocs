import { injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { User as UserModel } from "../../../../models/user.model";
import { UserMapper } from "../mappers/UserMapper";
import { Op } from "sequelize";

@injectable()
export class SequelizeUserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const raw = UserMapper.toPersistence(user);
    const exists = await UserModel.findByPk(user.id);

    if (exists) {
      await exists.update(raw);
      return UserMapper.toDomain(exists);
    } else {
      const created = await UserModel.create(raw);
      return UserMapper.toDomain(created);
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { mobile } });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  async existsByMobile(mobile: string, excludeId?: string): Promise<boolean> {
    const where: any = { mobile };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await UserModel.count({ where });
    return count > 0;
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const where: any = { email };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await UserModel.count({ where });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }

  async findAll(
    filters: { search?: string; role?: string; isActive?: boolean } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<{ users: User[]; total: number }> {
    const where: any = {};
    const offset = (pagination.page - 1) * pagination.limit;

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { mobile: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      limit: pagination.limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows.map(r => UserMapper.toDomain(r)),
      total: count
    };
  }
}
