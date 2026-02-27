import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Task, CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, TaskStats, PaginatedResponse } from '@app/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tasks`;

  /**
   * Get all tasks with filters
   */
  getTasks(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      priority?: string;
      clientId?: string;
      assignedTo?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      search?: string;
      createdBy?: string;
    },
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortOrder) params = params.set('sortOrder', sortOrder);

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.clientId) params = params.set('clientId', filters.clientId);
      if (filters.assignedTo) params = params.set('assignedTo', filters.assignedTo);
      if (filters.dueDateFrom) params = params.set('dueDateFrom', filters.dueDateFrom);
      if (filters.dueDateTo) params = params.set('dueDateTo', filters.dueDateTo);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
    }

    return this.http.get<PaginatedResponse<Task>>(this.baseUrl, { params });
  }

  /**
   * Get task statistics for dashboard
   */
  getTaskStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Get urgent tasks (high priority and due soon)
   */
  getUrgentTasks(limit: number = 5): Observable<Task[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Task[]>(`${this.baseUrl}/urgent`, { params });
  }

  /**
   * Get single task by ID
   */
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get tasks for current user
   */
  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/my-tasks`);
  }

  /**
   * Get tasks for a specific client
   */
  getTasksByClient(clientId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /**
   * Create a new task
   */
  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  /**
   * Update a task
   */
  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  /**
   * Update task status only (for kanban drag-drop)
   */
  updateTaskStatus(id: string, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, { status });
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
