import { Request, Response } from 'express';
import { taskService } from '../services';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middlewares';
import { BadRequestError } from '../utils/errors';

/**
 * Get all tasks with filters
 * GET /tasks
 */
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sortBy, sortOrder, status, clientId, assignedTo, priority, dueDateFrom, dueDateTo, search, createdBy } = req.query;

  const filters = {
    status: status as string,
    clientId: clientId as string,
    assignedTo: assignedTo as string,
    priority: priority as string,
    search: search as string,
    createdBy: createdBy as string,
    dueDateFrom: dueDateFrom ? new Date(dueDateFrom as string) : undefined,
    dueDateTo: dueDateTo ? new Date(dueDateTo as string) : undefined,
  };

  const { tasks, total } = await taskService.getTasks(filters, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc' | undefined,
  });

  sendPaginated(res, tasks, total, parseInt(page as string), parseInt(limit as string));
});

/**
 * Get task statistics
 * GET /tasks/stats
 */
export const getTaskStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await taskService.getTaskStats();
  sendSuccess(res, stats);
});

/**
 * Get urgent tasks (dashboard widget)
 * GET /tasks/urgent
 */
export const getUrgentTasks = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 5 } = req.query;
  const tasks = await taskService.getUrgentTasks(parseInt(limit as string) || 5);
  sendSuccess(res, tasks);
});

/**
 * Get tasks for a specific client
 * GET /tasks/client/:clientId
 */
export const getTasksByClient = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.getTasksByClient(req.params.clientId);
  sendSuccess(res, tasks);
});

/**
 * Get tasks for current user
 * GET /tasks/my-tasks
 */
export const getMyTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.getTasksByUser(req.user!.userId);
  sendSuccess(res, tasks);
});

/**
 * Get single task
 * GET /tasks/:id
 */
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);
  sendSuccess(res, task);
});

/**
 * Create a new task
 * POST /tasks
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, clientId, assignedTo, priority, status, dueDate, tags } = req.body;

  if (!title) {
    throw new BadRequestError('Task title is required');
  }

  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const task = await taskService.createTask(
    {
      title,
      description,
      clientId,
      assignedTo,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
    },
    userId,
    ip
  );

  sendCreated(res, task, 'Task created successfully');
});

/**
 * Update a task
 * PUT /tasks/:id
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, clientId, assignedTo, priority, status, dueDate, tags } = req.body;

  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const task = await taskService.updateTask(
    req.params.id,
    {
      title,
      description,
      clientId,
      assignedTo,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
    },
    userId,
    ip
  );

  sendSuccess(res, task, 'Task updated successfully');
});

/**
 * Update task status only (for kanban drag-drop)
 * PATCH /tasks/:id/status
 */
export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    throw new BadRequestError('Status is required');
  }

  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  const task = await taskService.updateTaskStatus(req.params.id, status, userId, ip);

  sendSuccess(res, task, 'Task status updated successfully');
});

/**
 * Delete a task
 * DELETE /tasks/:id
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ip = req.ip || req.socket.remoteAddress;

  await taskService.deleteTask(req.params.id, userId, ip);

  sendNoContent(res);
});
