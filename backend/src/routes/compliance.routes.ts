import { Router } from 'express';
import { complianceController } from '../controllers/compliance.controller';
import { authenticate, adminOnly } from '../middlewares';

const router = Router();

// Require authentication for all routes
router.use(authenticate);

// ========== STATS & WIDGETS ==========

/**
 * @swagger
 * /compliance/stats:
 *   get:
 *     summary: Get compliance statistics
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compliance statistics
 */
router.get('/stats', adminOnly, complianceController.getStats);

/**
 * @swagger
 * /compliance/upcoming:
 *   get:
 *     summary: Get upcoming deadlines within 7 days
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming deadline assignments
 */
router.get('/upcoming', adminOnly, complianceController.getUpcomingThisWeek);

/**
 * @swagger
 * /compliance/overdue:
 *   get:
 *     summary: Get all overdue deadline assignments
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue deadline assignments
 */
router.get('/overdue', adminOnly, complianceController.getOverdue);

// ========== CLIENT DEADLINE ASSIGNMENTS ==========

/**
 * @swagger
 * /compliance/client-deadlines:
 *   get:
 *     summary: Get client deadline assignments with filters
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: deadlineId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, filed, overdue]
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
 *     responses:
 *       200:
 *         description: Client deadline assignments
 */
router.get('/client-deadlines', adminOnly, complianceController.getClientDeadlines);

/**
 * @swagger
 * /compliance/client-deadlines/{clientDeadlineId}:
 *   patch:
 *     summary: Update a client deadline (status, filedDate, notes)
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientDeadlineId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, filed, overdue]
 *               filedDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client deadline updated
 */
router.patch('/client-deadlines/:clientDeadlineId', adminOnly, complianceController.updateClientDeadline);

/**
 * @swagger
 * /compliance/client-deadlines/{clientDeadlineId}:
 *   delete:
 *     summary: Remove a client from a deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientDeadlineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Client deadline removed
 */
router.delete('/client-deadlines/:clientDeadlineId', adminOnly, complianceController.removeClientDeadline);

// ========== DEADLINE ROUTES ==========

/**
 * @swagger
 * /compliance/deadlines:
 *   get:
 *     summary: Get all compliance deadlines with filters
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ITR, GST, TDS, ROC, ADVANCE_TAX, OTHER]
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: List of compliance deadlines
 */
router.get('/deadlines', complianceController.getDeadlines);

/**
 * @swagger
 * /compliance/deadlines/{deadlineId}:
 *   get:
 *     summary: Get a single deadline with assigned clients
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deadlineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deadline details with client assignments
 */
router.get('/deadlines/:deadlineId', complianceController.getDeadline);

/**
 * @swagger
 * /compliance/deadlines:
 *   post:
 *     summary: Create a custom compliance deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - dueDate
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ITR, GST, TDS, ROC, ADVANCE_TAX, OTHER]
 *               title:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               recurring:
 *                 type: boolean
 *               recurringPattern:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deadline created
 */
router.post('/deadlines', adminOnly, complianceController.createDeadline);

/**
 * @swagger
 * /compliance/deadlines/{deadlineId}:
 *   patch:
 *     summary: Update a compliance deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deadlineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deadline updated
 */
router.patch('/deadlines/:deadlineId', adminOnly, complianceController.updateDeadline);

/**
 * @swagger
 * /compliance/deadlines/{deadlineId}:
 *   delete:
 *     summary: Delete a compliance deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deadlineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deadline deleted
 */
router.delete('/deadlines/:deadlineId', adminOnly, complianceController.deleteDeadline);

// ========== ASSIGN CLIENTS ==========

/**
 * @swagger
 * /compliance/deadlines/{deadlineId}/assign:
 *   post:
 *     summary: Assign a single client to a deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deadlineId
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
 *               - clientId
 *             properties:
 *               clientId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client assigned
 */
router.post('/deadlines/:deadlineId/assign', adminOnly, complianceController.assignClient);

/**
 * @swagger
 * /compliance/deadlines/{deadlineId}/bulk-assign:
 *   post:
 *     summary: Bulk assign clients to a deadline
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deadlineId
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
 *               - clientIds
 *             properties:
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Clients assigned
 */
router.post('/deadlines/:deadlineId/bulk-assign', adminOnly, complianceController.bulkAssignClients);

export default router;
