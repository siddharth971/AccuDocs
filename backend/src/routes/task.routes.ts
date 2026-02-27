import { Router } from 'express';
import { taskController } from '../controllers';
import { authenticate } from '../middlewares';

const router = Router();

// Require authentication for all routes
router.use(authenticate);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics (dashboard)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get('/stats', taskController.getTaskStats);

/**
 * @swagger
 * /tasks/urgent:
 *   get:
 *     summary: Get urgent tasks (high priority and due soon)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of urgent tasks
 */
router.get('/urgent', taskController.getUrgentTasks);

/**
 * @swagger
 * /tasks/my-tasks:
 *   get:
 *     summary: Get tasks for current user (created or assigned)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user tasks
 */
router.get('/my-tasks', taskController.getMyTasks);

/**
 * @swagger
 * /tasks/client/{clientId}:
 *   get:
 *     summary: Get tasks for a specific client
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks for client
 */
router.get('/client/:clientId', taskController.getTasksByClient);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks with filters
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 */
router.get('/', taskController.getTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               clientId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 default: todo
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', taskController.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 */
router.get('/:id', taskController.getTask);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               clientId:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/:id', taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Update task status only (for kanban drag-drop)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 */
router.patch('/:id/status', taskController.updateTaskStatus);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 */
router.delete('/:id', taskController.deleteTask);

export default router;
