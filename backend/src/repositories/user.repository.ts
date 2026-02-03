import { User, UserAttributes, UserCreationAttributes, UserRole } from '../models';
import { Op } from 'sequelize';

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  },

  async findByMobile(mobile: string): Promise<User | null> {
    return User.findOne({ where: { mobile } });
  },

  async create(data: UserCreationAttributes, options?: any): Promise<User> {
    return User.create(data, options) as unknown as Promise<User>;
  },

  async update(id: string, data: Partial<UserAttributes>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(data);
    return user;
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  },

  async findAll(
    filters: UserFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<{ users: User[]; total: number }> {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { mobile: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any = pagination.sortBy
      ? [[pagination.sortBy, pagination.sortOrder || 'desc']]
      : [['createdAt', 'desc']];

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      offset,
      limit: pagination.limit,
      order,
    });

    return { users, total };
  },

  async updateLastLogin(id: string): Promise<void> {
    await User.update({ lastLogin: new Date() }, { where: { id } });
  },

  async countByRole(role: UserRole): Promise<number> {
    return User.count({ where: { role } });
  },

  async existsByMobile(mobile: string, excludeId?: string): Promise<boolean> {
    const where: any = { mobile };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await User.count({ where });
    return count > 0;
  },
};
