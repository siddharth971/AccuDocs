import { Router } from 'express';
import { whatsappController } from '../controllers';
import { authenticate, adminOnly, validateBody } from '../middlewares';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * /whatsapp/webhook:
 *   get:
 *     summary: Webhook verification
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verified
 */
router.get('/webhook', whatsappController.verifyWebhook);

/**
 * @swagger
 * /whatsapp/webhook:
 *   post:
 *     summary: Handle incoming WhatsApp messages
 *     tags: [WhatsApp]
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               From:
 *                 type: string
 *               Body:
 *                 type: string
 *               MessageSid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message processed
 */
router.post('/webhook', whatsappController.handleWebhook);

// Admin-only routes below
router.use(authenticate, adminOnly);

/**
 * @swagger
 * /whatsapp/send:
 *   post:
 *     summary: Send WhatsApp message (admin only)
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post(
  '/send',
  validateBody(
    z.object({
      to: z.string().min(1),
      message: z.string().min(1),
    })
  ),
  whatsappController.sendMessage
);

/**
 * @swagger
 * /whatsapp/session/{mobile}:
 *   get:
 *     summary: Get WhatsApp session status
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mobile
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status
 */
router.get('/session/:mobile', whatsappController.getSession);

/**
 * @swagger
 * /whatsapp/session/{mobile}:
 *   delete:
 *     summary: Clear WhatsApp session
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mobile
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session cleared
 */
router.delete('/session/:mobile', whatsappController.clearSession);

export default router;
