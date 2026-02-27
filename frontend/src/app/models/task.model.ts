export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | Date;
  tags: string[];
  completedAt?: string | Date;
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
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  clientId?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | Date;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  clientId?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | Date;
  tags?: string[];
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
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

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
