import { taskRepository, logRepository } from '../repositories';
import { Task, TaskStatus } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface CreateTaskDto {
  title: string;
  description?: string;
  clientId?: string;
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: TaskStatus;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  clientId?: string;
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: TaskStatus;
  dueDate?: Date;
  tags?: string[];
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  dueDate?: Date;
  tags: string[];
  completedAt?: Date;
  client?: {
    id: string;
    code: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
    email?: string;
  };
  assignee?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatsResponse {
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

export const taskService = {
  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(
    filters: {
      status?: string;
      clientId?: string;
      assignedTo?: string;
      priority?: string;
      dueDateFrom?: Date;
      dueDateTo?: Date;
      search?: string;
      createdBy?: string;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ tasks: TaskResponse[]; total: number }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;

    const { tasks, total } = await taskRepository.findAll(filters, {
      page,
      limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });

    return {
      tasks: tasks.map((task) => this.formatTaskResponse(task)),
      total,
    };
  },

  /**
   * Get single task by ID
   */
  async getTaskById(id: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return this.formatTaskResponse(task);
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskDto, createdBy: string, ip?: string): Promise<TaskResponse> {
    if (!data.title || data.title.trim().length === 0) {
      throw new BadRequestError('Task title is required');
    }

    const task = await taskRepository.create({
      ...data,
      createdBy,
      priority: data.priority || 'medium',
      status: data.status || 'todo',
      tags: data.tags || [],
    });

    // Log the action
    await logRepository.create({
      userId: createdBy,
      action: 'TASK_CREATED',
      description: `Task created: "${task.title}"`,
      entityId: task.id,
      entityType: 'Task',
      ip,
    });

    return this.formatTaskResponse(task);
  },

  /**
   * Update a task
   */
  async updateTask(id: string, data: UpdateTaskDto, userId: string, ip?: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updateData: any = { ...data };

    // Auto-set completedAt when status changes to 'done'
    if (data.status === 'done' && task.status !== 'done') {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== 'done' && task.status === 'done') {
      updateData.completedAt = null;
    }

    const updatedTask = await taskRepository.update(id, updateData);
    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    // Log the action
    await logRepository.create({
      userId,
      action: 'TASK_UPDATED',
      description: `Task updated: "${updatedTask.title}"`,
      entityId: id,
      entityType: 'Task',
      ip,
    });

    return this.formatTaskResponse(updatedTask);
  },

  /**
   * Update task status only (for kanban drag-drop)
   */
  async updateTaskStatus(id: string, status: TaskStatus, userId: string, ip?: string): Promise<TaskResponse> {
    const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updatedTask = await taskRepository.updateStatus(id, status);
    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    // Log the action
    await logRepository.create({
      userId,
      action: 'TASK_STATUS_UPDATED',
      description: `Task status updated to "${status}": "${updatedTask.title}"`,
      entityId: id,
      entityType: 'Task',
      ip,
    });

    return this.formatTaskResponse(updatedTask);
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string, userId: string, ip?: string): Promise<void> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Failed to delete task');
    }

    // Log the action
    await logRepository.create({
      userId,
      action: 'TASK_DELETED',
      description: `Task deleted: "${task.title}"`,
      entityId: id,
      entityType: 'Task',
      ip,
    });
  },

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<TaskStatsResponse> {
    return taskRepository.getStats();
  },

  /**
   * Get tasks for a specific client
   */
  async getTasksByClient(clientId: string): Promise<TaskResponse[]> {
    const tasks = await taskRepository.getTasksByClientId(clientId);
    return tasks.map((task) => this.formatTaskResponse(task));
  },

  /**
   * Get tasks for a specific user (created or assigned)
   */
  async getTasksByUser(userId: string): Promise<TaskResponse[]> {
    const tasks = await taskRepository.getTasksByUserId(userId);
    return tasks.map((task) => this.formatTaskResponse(task));
  },

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<TaskResponse[]> {
    const tasks = await taskRepository.getOverdueTasks();
    return tasks.map((task) => this.formatTaskResponse(task));
  },

  /**
   * Get tasks due today
   */
  async getDueTodayTasks(): Promise<TaskResponse[]> {
    const tasks = await taskRepository.getDueTodayTasks();
    return tasks.map((task) => this.formatTaskResponse(task));
  },

  /**
   * Get urgent tasks (high priority and due soon)
   */
  async getUrgentTasks(limit: number = 5): Promise<TaskResponse[]> {
    const tasks = await taskRepository.getUrgentTasks(limit);
    return tasks.map((task) => this.formatTaskResponse(task));
  },

  /**
   * Format task response for API
   */
  formatTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      clientId: task.clientId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      tags: task.tags || [],
      completedAt: task.completedAt,
      client: task.client
        ? {
            id: task.client.id,
            code: task.client.code,
            name: task.client.name,
          }
        : undefined,
      creator: task.creator
        ? {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          }
        : undefined,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  },
};
