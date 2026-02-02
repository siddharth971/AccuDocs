import { Router } from 'express';
import { clientController } from '../controllers';
import { authenticate, adminOnly, validateBody, validateQuery } from '../middlewares';
import { createClientSchema, updateClientSchema, paginationSchema } from '../utils/validators';

const router = Router();

// All client routes require admin authentication
router.use(authenticate, adminOnly);

/**
 * @swagger
 * /clients/next-code:
 *   get:
 *     summary: Get next available client code
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Next code returned
 */
router.get('/next-code', clientController.getNextCode);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
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
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/', validateQuery(paginationSchema), clientController.getClients);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
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
 *               - mobile
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created
 */
router.post('/', validateBody(createClientSchema), clientController.createClient);

/**
 * @swagger
 * /clients/code/{code}:
 *   get:
 *     summary: Get client by code
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client found
 */
router.get('/code/:code', clientController.getClientByCode);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
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
 *         description: Client found
 */
router.get('/:id', clientController.getClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated
 */
router.put('/:id', validateBody(updateClientSchema), clientController.updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete client
 *     tags: [Clients]
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
 *         description: Client deleted
 */
router.delete('/:id', clientController.deleteClient);

/**
 * @swagger
 * /clients/{id}/toggle-active:
 *   patch:
 *     summary: Toggle client active status
 *     tags: [Clients]
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
 *         description: Status toggled
 */
router.patch('/:id/toggle-active', clientController.toggleClientActive);

export default router;
