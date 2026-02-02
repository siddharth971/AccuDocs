import { Router } from 'express';
import { documentController } from '../controllers';
import { authenticate, adminOnly, authenticated, uploadSingle, uploadLimiter, validateQuery } from '../middlewares';
import { paginationSchema } from '../utils/validators';

const router = Router();

// Require authentication for all routes
router.use(authenticate);

/**
 * @swagger
 * /documents/stats:
 *   get:
 *     summary: Get storage statistics
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Storage statistics
 */
router.get('/stats', adminOnly, documentController.getStorageStats);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents (admin only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: yearId
 *         schema:
 *           type: string
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
 *         description: List of documents
 */
router.get('/', adminOnly, validateQuery(paginationSchema), documentController.getAllDocuments);

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - yearId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               yearId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post('/upload', adminOnly, uploadLimiter, uploadSingle, documentController.uploadDocument);

/**
 * @swagger
 * /documents/year/{yearId}:
 *   get:
 *     summary: Get documents by year
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: yearId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents for the year
 */
router.get('/year/:yearId', documentController.getDocumentsByYear);

/**
 * @swagger
 * /documents/{id}/download:
 *   get:
 *     summary: Get document download URL
 *     tags: [Documents]
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
 *         description: Download URL
 */
router.get('/:id/download', documentController.getDownloadUrl);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
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
 *         description: Document deleted
 */
router.delete('/:id', adminOnly, documentController.deleteDocument);

export default router;
