import { Task, TaskAttributes, TaskCreationAttributes, User, Client } from '../models';
import { Op } from 'sequelize';

export interface TaskFilters {
  status?: string;
  clientId?: string;
  assignedTo?: string;
  priority?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
  createdBy?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStats {
  totalTasks: number;
  dueTodayCount: number;
  overdueCount: number;
  byStatus: {
    todo: number;
    'in-progress': number;
    review: number;
    done: number;
  };
}

export const taskRepository = {
  async findById(id: string): Promise<Task | null> {
    return Task.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
    });
  },

  async create(data: TaskCreationAttributes): Promise<Task> {
    return Task.create(data);
  },

  async update(id: string, data: Partial<TaskAttributes>): Promise<Task | null> {
    const task = await this.findById(id);
    if (!task) {
      return null;
    }
    return task.update(data);
  },

  async updateStatus(id: string, status: string): Promise<Task | null> {
    const task = await this.findById(id);
    if (!task) {
      return null;
    }

    const updateData: any = { status };
    if (status === 'done' && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (status !== 'done') {
      updateData.completedAt = null;
    }

    return task.update(updateData);
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await Task.destroy({ where: { id } });
    return deleted > 0;
  },

  async findAll(
    filters: TaskFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<{ tasks: Task[]; total: number }> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate[Op.gte] = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        where.dueDate[Op.lte] = filters.dueDateTo;
      }
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (pagination.page - 1) * pagination.limit;
    const order: any[] = [];

    if (pagination.sortBy) {
      order.push([pagination.sortBy, pagination.sortOrder || 'asc']);
    } else {
      order.push(['createdAt', 'desc']);
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
      offset,
      limit: pagination.limit,
      order,
      distinct: true,
    });

    return { tasks: rows, total: count };
  },

  async getStats(): Promise<TaskStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTasks,
      dueTodayCount,
      overdueCount,
      todoCount,
      inProgressCount,
      reviewCount,
      doneCount,
    ] = await Promise.all([
      (Task.count({ where: { status: { [Op.ne]: null } } as any }) as Promise<number>),
      (Task.count({
        where: {
          dueDate: { [Op.gte]: today, [Op.lt]: tomorrow },
        } as any,
      }) as Promise<number>),
      (Task.count({
        where: {
          dueDate: { [Op.lt]: today },
          status: { [Op.ne]: 'done' },
        } as any,
      }) as Promise<number>),
      (Task.count({ where: { status: 'todo' } as any }) as Promise<number>),
      (Task.count({ where: { status: 'in-progress' } as any }) as Promise<number>),
      (Task.count({ where: { status: 'review' } as any }) as Promise<number>),
      (Task.count({ where: { status: 'done' } as any }) as Promise<number>),
    ]);

    return {
      totalTasks,
      dueTodayCount,
      overdueCount,
      byStatus: {
        todo: todoCount,
        'in-progress': inProgressCount,
        review: reviewCount,
        done: doneCount,
      },
    };
  },

  async getTasksByClientId(clientId: string, limit: number = 10): Promise<Task[]> {
    return Task.findAll({
      where: { clientId } as any,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['dueDate', 'asc']],
      limit,
    });
  },

  async getTasksByUserId(userId: string, limit: number = 10): Promise<Task[]> {
    return Task.findAll({
      where: {
        [Op.or]: [
          { createdBy: userId },
          { assignedTo: userId },
        ],
      } as any,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
      order: [['dueDate', 'asc']],
      limit,
    });
  },

  async getOverdueTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Task.findAll({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.ne]: 'done' },
      } as any,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
      order: [['dueDate', 'asc']],
    });
  },

  async getDueTodayTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Task.findAll({
      where: {
        dueDate: { [Op.gte]: today, [Op.lt]: tomorrow },
        status: { [Op.ne]: 'done' },
      } as any,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
      order: [['dueDate', 'asc']],
    });
  },

  async getUrgentTasks(limit: number = 5): Promise<Task[]> {
    return Task.findAll({
      where: {
        status: { [Op.ne]: 'done' },
      } as any,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'client', attributes: ['id', 'code', 'name'] },
      ],
      order: [
        ['priority', 'desc'],
        ['dueDate', 'asc'],
      ],
      limit,
    });
  },
};
