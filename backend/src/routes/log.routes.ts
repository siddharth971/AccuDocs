import { Router } from 'express';
import { logController } from '../controllers';
import { authenticate, adminOnly, validateQuery } from '../middlewares';
import { logFilterSchema } from '../utils/validators';

const router = Router();

// Require admin authentication for all routes
router.use(authenticate);

/**
 * @swagger
 * /logs/me:
 *   get:
 *     summary: Get current user's logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's activity logs
 */
router.get('/me', logController.getMyLogs);

// Admin-only routes below
router.use(adminOnly);

/**
 * @swagger
 * /logs/stats:
 *   get:
 *     summary: Get log statistics
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Log statistics
 */
router.get('/stats', logController.getLogStats);

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs (admin only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of logs
 */
router.get('/', validateQuery(logFilterSchema), logController.getLogs);

/**
 * @swagger
 * /logs/cleanup:
 *   delete:
 *     summary: Cleanup old logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: retentionDays
 *         schema:
 *           type: integer
 *           default: 90
 *     responses:
 *       200:
 *         description: Logs cleaned up
 */
router.delete('/cleanup', logController.cleanupLogs);

export default router;
