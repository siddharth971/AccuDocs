import { Router } from 'express';
import { workspaceController } from '../controllers';
import { authenticate, adminOnly, uploadSingle, uploadLimiter } from '../middlewares';

const router = Router();

// Require authentication for all routes
router.use(authenticate);

/**
 * @swagger
 * /workspace/files:
 *   get:
 *     summary: Get all files across all clients (admin file manager)
 *     tags: [Workspace]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: mimeType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all files with client info
 */
router.get('/files', adminOnly, workspaceController.getAllFiles);

/**
 * @swagger
 * /workspace/clients/{clientId}:
 *   get:
 *     summary: Get client workspace (folder tree)
 *     tags: [Workspace]
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
 *         description: Client workspace tree
 */
router.get('/clients/:clientId', workspaceController.getClientWorkspace);

/**
 * @swagger
 * /workspace/folders/{folderId}:
 *   get:
 *     summary: Get folder contents
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folder contents with breadcrumbs
 */
router.get('/folders/:folderId', workspaceController.getFolderContents);

/**
 * @swagger
 * /workspace/files/upload:
 *   post:
 *     summary: Upload file to folder
 *     tags: [Workspace]
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
 *               - folderId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post('/files/upload', adminOnly, uploadLimiter, uploadSingle, workspaceController.uploadFile);

/**
 * @swagger
 * /workspace/files/{fileId}/download:
 *   get:
 *     summary: Get file download URL
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download URL
 */
router.get('/files/:fileId/download', workspaceController.getFileDownloadUrl);

/**
 * @swagger
 * /workspace/files/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: File deleted
 */
router.delete('/files/:fileId', adminOnly, workspaceController.deleteFile);

/**
 * @swagger
 * /workspace/files/{fileId}/rename:
 *   patch:
 *     summary: Rename a file
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: File renamed
 */
router.patch('/files/:fileId/rename', adminOnly, workspaceController.renameFile);

/**
 * @swagger
 * /workspace/files/{fileId}/move:
 *   patch:
 *     summary: Move a file to another folder
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
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
 *               - targetFolderId
 *             properties:
 *               targetFolderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: File moved
 */
router.patch('/files/:fileId/move', adminOnly, workspaceController.moveFile);

/**
 * @swagger
 * /workspace/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parentFolderId
 *               - name
 *             properties:
 *               parentFolderId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Folder created
 */
router.post('/folders', adminOnly, workspaceController.createFolder);

/**
 * @swagger
 * /workspace/folders/{folderId}:
 *   delete:
 *     summary: Delete a folder
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Folder deleted
 */
router.delete('/folders/:folderId', adminOnly, workspaceController.deleteFolder);

/**
 * @swagger
 * /workspace/folders/{folderId}/rename:
 *   patch:
 *     summary: Rename a folder
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder renamed
 */
router.patch('/folders/:folderId/rename', adminOnly, workspaceController.renameFolder);

/**
 * @swagger
 * /workspace/clients/{clientId}/years:
 *   post:
 *     summary: Add year folder to client
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
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
 *               - year
 *             properties:
 *               year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Year folder created
 */
router.post('/clients/:clientId/years', adminOnly, workspaceController.addYearFolder);

export default router;
