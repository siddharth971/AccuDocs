import { Router } from 'express';
import { checklistController } from '../controllers/checklist.controller';
import { authenticate, adminOnly } from '../middlewares';

const router = Router();

// Require authentication for all routes
router.use(authenticate);

// ========== TEMPLATE ROUTES ==========

/**
 * @swagger
 * /checklists/templates:
 *   get:
 *     summary: Get all checklist templates
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of checklist templates
 */
router.get('/templates', checklistController.getTemplates);

/**
 * @swagger
 * /checklists/templates/{templateId}:
 *   get:
 *     summary: Get a single checklist template
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 */
router.get('/templates/:templateId', checklistController.getTemplate);

/**
 * @swagger
 * /checklists/templates:
 *   post:
 *     summary: Create a custom checklist template
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serviceType
 *               - items
 *             properties:
 *               name:
 *                 type: string
 *               serviceType:
 *                 type: string
 *                 enum: [itr, gst, audit, roc, tds, custom]
 *               description:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     description:
 *                       type: string
 *                     required:
 *                       type: boolean
 *                     category:
 *                       type: string
 *     responses:
 *       201:
 *         description: Template created
 */
router.post('/templates', adminOnly, checklistController.createTemplate);

/**
 * @swagger
 * /checklists/templates/{templateId}:
 *   patch:
 *     summary: Update a custom template
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template updated
 */
router.patch('/templates/:templateId', adminOnly, checklistController.updateTemplate);

/**
 * @swagger
 * /checklists/templates/{templateId}:
 *   delete:
 *     summary: Delete a custom template
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Template deleted
 */
router.delete('/templates/:templateId', adminOnly, checklistController.deleteTemplate);

// ========== STATS ROUTES ==========

/**
 * @swagger
 * /checklists/stats:
 *   get:
 *     summary: Get checklist statistics
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checklist statistics
 */
router.get('/stats', adminOnly, checklistController.getStats);

/**
 * @swagger
 * /checklists/pending:
 *   get:
 *     summary: Get pending documents summary across all clients
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending documents summary
 */
router.get('/pending', adminOnly, checklistController.getPendingDocuments);

// ========== CHECKLIST ROUTES ==========

/**
 * @swagger
 * /checklists:
 *   get:
 *     summary: Get all checklists with filters and pagination
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: financialYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of checklists
 */
router.get('/', checklistController.getChecklists);

/**
 * @swagger
 * /checklists/bulk-create:
 *   post:
 *     summary: Bulk create checklists for multiple clients from a template
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - financialYear
 *             properties:
 *               templateId:
 *                 type: string
 *               clientIds:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *                     enum: [all]
 *               financialYear:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Bulk creation result with created/skipped counts
 */
router.post('/bulk-create', adminOnly, checklistController.bulkCreateChecklists);

/**
 * @swagger
 * /checklists/client/{clientId}:
 *   get:
 *     summary: Get all checklists for a specific client
 *     tags: [Checklists]
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
 *         description: Client checklists
 */
router.get('/client/:clientId', checklistController.getClientChecklists);

/**
 * @swagger
 * /checklists/{checklistId}:
 *   get:
 *     summary: Get a single checklist with all items
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checklist details with items
 */
router.get('/:checklistId', checklistController.getChecklist);

/**
 * @swagger
 * /checklists:
 *   post:
 *     summary: Create a new checklist for a client
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - name
 *               - financialYear
 *               - serviceType
 *             properties:
 *               clientId:
 *                 type: string
 *               templateId:
 *                 type: string
 *               name:
 *                 type: string
 *               financialYear:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Checklist created
 */
router.post('/', adminOnly, checklistController.createChecklist);

/**
 * @swagger
 * /checklists/{checklistId}:
 *   patch:
 *     summary: Update checklist details
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checklist updated
 */
router.patch('/:checklistId', adminOnly, checklistController.updateChecklist);

/**
 * @swagger
 * /checklists/{checklistId}:
 *   delete:
 *     summary: Delete a checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Checklist deleted
 */
router.delete('/:checklistId', adminOnly, checklistController.deleteChecklist);

/**
 * @swagger
 * /checklists/{checklistId}/reminder:
 *   post:
 *     summary: Send a WhatsApp reminder to the client
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder sent
 */
router.post('/:checklistId/reminder', adminOnly, checklistController.sendReminder);

// ========== ITEM ROUTES ==========

/**
 * @swagger
 * /checklists/{checklistId}/items:
 *   post:
 *     summary: Add a new item to a checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
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
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               required:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item added
 */
router.post('/:checklistId/items', adminOnly, checklistController.addItem);

/**
 * @swagger
 * /checklists/{checklistId}/items/{itemId}/status:
 *   patch:
 *     summary: Update item status (received, pending, not_applicable, rejected)
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *                 enum: [pending, received, not_applicable, rejected]
 *               fileId:
 *                 type: string
 *               fileName:
 *                 type: string
 *               rejectionReason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item status updated
 */
router.patch('/:checklistId/items/:itemId/status', adminOnly, checklistController.updateItemStatus);

/**
 * @swagger
 * /checklists/{checklistId}/items/bulk-update:
 *   patch:
 *     summary: Bulk update item statuses
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
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
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Items updated
 */
router.patch('/:checklistId/items/bulk-update', adminOnly, checklistController.bulkUpdateItemStatus);

/**
 * @swagger
 * /checklists/{checklistId}/items/{itemId}:
 *   delete:
 *     summary: Remove an item from a checklist
 *     tags: [Checklists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/:checklistId/items/:itemId', adminOnly, checklistController.removeItem);

// ========== UPLOAD/DOWNLOAD ROUTES ==========

import { uploadController } from '../controllers/upload.controller';
import multer from 'multer';

const _upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
});

/**
 * POST /checklists/:checklistId/generate-link
 * Generate a secure upload link for a checklist
 */
router.post('/:checklistId/generate-link', adminOnly, uploadController.generateUploadLink);

/**
 * POST /checklists/:checklistId/items/:itemId/upload
 * Upload a file to a checklist item (admin)
 */
router.post('/:checklistId/items/:itemId/upload', adminOnly, _upload.single('file'), uploadController.uploadViaAdmin);

/**
 * GET /checklists/:checklistId/download/:itemId
 * Download a single checklist item file
 */
router.get('/:checklistId/download/:itemId', uploadController.downloadFile);

/**
 * GET /checklists/:checklistId/download-all
 * Download all checklist files as ZIP
 */
router.get('/:checklistId/download-all', uploadController.downloadAllAsZip);

/**
 * PATCH /checklists/:checklistId/items/:itemId/status
 * Verify or reject a checklist item
 */
router.patch('/:checklistId/items/:itemId/status', adminOnly, uploadController.updateItemStatus);

export default router;

