import { Router } from 'express';
import { whatsappController } from '../controllers';
import { authenticate, adminOnly, validateBody } from '../middlewares';
import { z } from 'zod';

const router = Router();


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

/**
 * @swagger
 * /whatsapp/qr:
 *   get:
 *     summary: Get WhatsApp QR code and status
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code and status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [INITIALIZING, QR_READY, AUTHENTICATED, DISCONNECTED]
 *                 qrCode:
 *                   type: string
 *                   nullable: true
 */
router.get('/qr', whatsappController.getQR);

/**
 * @swagger
 * /whatsapp/logout:
 *   post:
 *     summary: Disconnect bot and regenerate QR
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bot disconnected
 */
router.post('/logout', whatsappController.logout);

/**
 * @swagger
 * /whatsapp/chats:
 *   get:
 *     summary: Get all active chats
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active chats
 */
router.get('/chats', whatsappController.getChats);

export default router;
